package com.cinemadesi.service;

import com.cinemadesi.dto.request.RecommendFilmRequest;
import com.cinemadesi.dto.request.UpdateRecommendationStatusRequest;
import com.cinemadesi.dto.response.RecommendationResponse;
import com.cinemadesi.entity.Film;
import com.cinemadesi.entity.Group;
import com.cinemadesi.entity.Recommendation;
import com.cinemadesi.entity.User;
import com.cinemadesi.entity.WatchlistItem;
import com.cinemadesi.entity.enums.RecommendationStatus;
import com.cinemadesi.exception.ResourceNotFoundException;
import com.cinemadesi.exception.UnauthorizedException;
import com.cinemadesi.mapper.RecommendationMapper;
import com.cinemadesi.repository.FilmRepository;
import com.cinemadesi.repository.GroupMemberRepository;
import com.cinemadesi.repository.GroupRepository;
import com.cinemadesi.repository.RecommendationRepository;
import com.cinemadesi.repository.UserRepository;
import com.cinemadesi.repository.WatchlistItemRepository;
import com.cinemadesi.security.CurrentUserProvider;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class RecommendationService {

    private final RecommendationRepository  recRepo;
    private final WatchlistItemRepository   watchlistRepo;
    private final FilmRepository            filmRepo;
    private final UserRepository            userRepo;
    private final GroupRepository           groupRepo;
    private final GroupMemberRepository     memberRepo;
    private final RecommendationMapper      mapper;
    private final CurrentUserProvider       current;

    public RecommendationService(
            RecommendationRepository recRepo,
            WatchlistItemRepository watchlistRepo,
            FilmRepository filmRepo,
            UserRepository userRepo,
            GroupRepository groupRepo,
            GroupMemberRepository memberRepo,
            RecommendationMapper mapper,
            CurrentUserProvider current
    ) {
        this.recRepo       = recRepo;
        this.watchlistRepo = watchlistRepo;
        this.filmRepo      = filmRepo;
        this.userRepo      = userRepo;
        this.groupRepo     = groupRepo;
        this.memberRepo    = memberRepo;
        this.mapper        = mapper;
        this.current       = current;
    }

    @Transactional
    public RecommendationResponse send(RecommendFilmRequest req) {
        UUID myId = current.requireUserId();
        User from = userRepo.findById(myId)
                .orElseThrow(() -> new ResourceNotFoundException("user", myId));
        Film film = filmRepo.findById(req.filmId())
                .orElseThrow(() -> new ResourceNotFoundException("film", req.filmId()));

        Recommendation.RecommendationBuilder builder = Recommendation.builder()
                .fromUser(from)
                .film(film)
                .note(req.note())
                .status(RecommendationStatus.PENDING);

        if (req.toUserId() != null) {
            User toUser = userRepo.findById(req.toUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("user", req.toUserId()));
            builder.toUser(toUser);
        } else {
            Group toGroup = groupRepo.findById(req.toGroupId())
                    .orElseThrow(() -> new ResourceNotFoundException("group", req.toGroupId()));
            // sender must be a member of the target group
            if (!memberRepo.existsByGroupIdAndUserId(toGroup.getId(), myId)) {
                throw new UnauthorizedException("Cannot recommend to a group you are not in");
            }
            builder.toGroup(toGroup);
        }

        return mapper.toResponse(recRepo.save(builder.build()));
    }

    @Transactional(readOnly = true)
    public List<RecommendationResponse> inbox() {
        UUID myId = current.requireUserId();
        return recRepo.findByToUserIdOrderByCreatedAtDesc(myId).stream()
                .map(mapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<RecommendationResponse> sent() {
        UUID myId = current.requireUserId();
        return recRepo.findByFromUserIdOrderByCreatedAtDesc(myId).stream()
                .map(mapper::toResponse).toList();
    }

    @Transactional
    public RecommendationResponse updateStatus(UUID recId, UpdateRecommendationStatusRequest req) {
        UUID myId = current.requireUserId();
        Recommendation rec = recRepo.findById(recId)
                .orElseThrow(() -> new ResourceNotFoundException("recommendation", recId));

        // Only direct-to-user recommendations have a recipient who can save/dismiss.
        // Group recs would need a per-member state model — defer to a later phase.
        if (rec.getToUser() == null || !rec.getToUser().getId().equals(myId)) {
            throw new UnauthorizedException("Only the recipient can update a recommendation");
        }

        rec.setStatus(req.status());

        if (req.status() == RecommendationStatus.SAVED) {
            // Create a watchlist item with recommendedBy set — unless they
            // already have it on their list.
            if (!watchlistRepo.existsByUserIdAndFilmId(myId, rec.getFilm().getId())) {
                watchlistRepo.save(WatchlistItem.builder()
                        .user(rec.getToUser())
                        .film(rec.getFilm())
                        .recommendedBy(rec.getFromUser())
                        .build());
            }
        }
        return mapper.toResponse(rec);
    }
}
