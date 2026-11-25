package com.newsrater.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;

/**
 * A single article fetched from a URL. Its story may be null (a future RSS job
 * inserts articles before clustering assigns a story); manual paste always
 * sets one.
 */
@Entity
@Table(name = "articles")
public class Article {

    public enum FetchStatus {
        OK, FAILED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 2000)
    private String url;

    private String title;

    @Column(length = 2000)
    private String excerpt;

    /** Lead image, usually the page's og:image. Null when the page has none. */
    @Column(length = 2000)
    private String imageUrl;

    private Instant publishedAt;

    @ManyToOne
    @JoinColumn(name = "outlet_id")
    private Outlet outlet;

    @ManyToOne
    @JoinColumn(name = "story_id")
    private Story story;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FetchStatus fetchStatus = FetchStatus.OK;

    private String fetchError;

    /** Registrable domain, kept even when no outlet matched (Untracked). */
    @Column(nullable = false)
    private String domain;

    protected Article() {
    }

    public Article(String url, String domain) {
        this.url = url;
        this.domain = domain;
    }

    public Long getId() {
        return id;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getExcerpt() {
        return excerpt;
    }

    public void setExcerpt(String excerpt) {
        this.excerpt = excerpt;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Instant getPublishedAt() {
        return publishedAt;
    }

    public void setPublishedAt(Instant publishedAt) {
        this.publishedAt = publishedAt;
    }

    public Outlet getOutlet() {
        return outlet;
    }

    public void setOutlet(Outlet outlet) {
        this.outlet = outlet;
    }

    public Story getStory() {
        return story;
    }

    public void setStory(Story story) {
        this.story = story;
    }

    public FetchStatus getFetchStatus() {
        return fetchStatus;
    }

    public void setFetchStatus(FetchStatus fetchStatus) {
        this.fetchStatus = fetchStatus;
    }

    public String getFetchError() {
        return fetchError;
    }

    public void setFetchError(String fetchError) {
        this.fetchError = fetchError;
    }

    public String getDomain() {
        return domain;
    }

    public void setDomain(String domain) {
        this.domain = domain;
    }

    /** Bias comes from the outlet; unmatched domains are UNTRACKED. */
    public Bias bias() {
        return outlet != null ? outlet.getBias() : Bias.UNTRACKED;
    }
}
