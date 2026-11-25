package com.newsrater.service;

import com.newsrater.model.Outlet;
import com.newsrater.repository.OutletRepository;
import java.util.Optional;
import org.springframework.stereotype.Service;

/** Resolves a URL to a catalog outlet by its registrable domain. */
@Service
public class OutletMatcher {

    private final OutletRepository outlets;

    public OutletMatcher(OutletRepository outlets) {
        this.outlets = outlets;
    }

    /** The outlet for this URL, or empty when the domain is untracked. */
    public Optional<Outlet> match(String url) {
        String domain = DomainUtil.registrableDomain(url);
        if (domain == null) {
            return Optional.empty();
        }
        return outlets.findByDomain(domain);
    }
}
