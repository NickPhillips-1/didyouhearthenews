package com.newsrater.model;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * One event covered by multiple articles. Created manually from pasted URLs
 * now; a clustering job may create CLUSTERED stories later.
 */
@Entity
@Table(name = "stories")
public class Story {

    public enum Origin {
        MANUAL, CLUSTERED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 4000)
    private String summary;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Origin origin = Origin.MANUAL;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    @OneToMany(mappedBy = "story", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("id ASC")
    private List<Article> articles = new ArrayList<>();

    protected Story() {
    }

    public Story(String title, Origin origin) {
        this.title = title;
        this.origin = origin;
    }

    public void addArticle(Article article) {
        articles.add(article);
        article.setStory(this);
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public Origin getOrigin() {
        return origin;
    }

    public void setOrigin(Origin origin) {
        this.origin = origin;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public List<Article> getArticles() {
        return articles;
    }
}
