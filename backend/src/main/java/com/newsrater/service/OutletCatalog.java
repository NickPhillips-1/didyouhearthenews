package com.newsrater.service;

import com.newsrater.model.Bias;
import com.newsrater.model.Outlet;
import com.newsrater.repository.OutletRepository;
import jakarta.annotation.PostConstruct;
import java.util.List;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Seeds a starter US outlet catalog on startup when the table is empty.
 *
 * These ratings are a starter editorial catalog for the demo, not a measured
 * fact source. Bias lives on the outlet so a pasted URL and a future RSS item
 * from the same domain always score identically. Factuality and ownership are
 * intentionally left null.
 */
@Component
public class OutletCatalog {

    private final OutletRepository outlets;

    public OutletCatalog(OutletRepository outlets) {
        this.outlets = outlets;
    }

    @PostConstruct
    @Transactional
    public void seed() {
        if (outlets.count() > 0) {
            return;
        }
        outlets.saveAll(List.of(
                // Wire services / center
                new Outlet("apnews.com", "Associated Press", Bias.CENTER),
                new Outlet("reuters.com", "Reuters", Bias.CENTER),
                new Outlet("pbs.org", "PBS NewsHour", Bias.CENTER),
                new Outlet("cbsnews.com", "CBS News", Bias.CENTER),
                new Outlet("nbcnews.com", "NBC News", Bias.CENTER),
                new Outlet("abcnews.go.com", "ABC News", Bias.LEAN_LEFT),
                new Outlet("abcnews.com", "ABC News", Bias.LEAN_LEFT),
                new Outlet("usatoday.com", "USA Today", Bias.CENTER),
                new Outlet("thehill.com", "The Hill", Bias.CENTER),
                new Outlet("c-span.org", "C-SPAN", Bias.CENTER),

                // Left-leaning
                new Outlet("cnn.com", "CNN", Bias.LEAN_LEFT),
                new Outlet("nytimes.com", "New York Times", Bias.LEAN_LEFT),
                new Outlet("washingtonpost.com", "Washington Post", Bias.LEAN_LEFT),
                new Outlet("msnbc.com", "MSNBC", Bias.LEFT),
                new Outlet("theguardian.com", "The Guardian", Bias.LEAN_LEFT),
                new Outlet("vox.com", "Vox", Bias.LEFT),
                new Outlet("politico.com", "Politico", Bias.LEAN_LEFT),

                // Right-leaning
                new Outlet("foxnews.com", "Fox News", Bias.RIGHT),
                new Outlet("wsj.com", "Wall Street Journal", Bias.LEAN_RIGHT),
                new Outlet("nypost.com", "New York Post", Bias.RIGHT),
                new Outlet("realclearpolitics.com", "Real Clear Politics", Bias.LEAN_RIGHT),
                new Outlet("redstate.com", "RedState", Bias.RIGHT),
                new Outlet("washingtonexaminer.com", "Washington Examiner", Bias.LEAN_RIGHT),
                new Outlet("dailywire.com", "The Daily Wire", Bias.RIGHT),

                // Local / TV from the sample story
                new Outlet("ksat.com", "KSAT 12", Bias.CENTER),
                new Outlet("elpasotimes.com", "El Paso Times", Bias.CENTER),
                new Outlet("dallasnews.com", "Dallas Morning News", Bias.CENTER),
                new Outlet("nbcdfw.com", "NBC Dallas-Fort Worth", Bias.CENTER)
        ));
    }
}
