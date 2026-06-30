package com.cinemadesi.entity;

import jakarta.persistence.Column;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.MappedSuperclass;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;

import java.util.Objects;
import java.util.UUID;

/**
 * Shared root for every persistent entity in the domain.
 *
 * <p>Holds only the UUID primary key — timestamp columns vary too much
 * across the schema (some tables use {@code created_at}, others
 * {@code added_at} / {@code joined_at}) so each entity declares its own
 * audit fields where present.</p>
 *
 * <p>UUIDs are generated client-side by Hibernate's {@link UuidGenerator}
 * (v4 random) so they're available on the entity <em>before</em> persist —
 * useful for setting up bidirectional relations cleanly.</p>
 *
 * <p>equals/hashCode are based on the id and are safe to use after flush.
 * Transient entities (id == null) compare by identity.</p>
 */
@Getter
@Setter
@MappedSuperclass
public abstract class BaseEntity {

    @Id
    @GeneratedValue
    @UuidGenerator
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof BaseEntity that)) return false;
        return id != null && Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        // Stable hash that doesn't change once id is assigned.
        return getClass().hashCode();
    }
}
