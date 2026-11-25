---- MODULE StoryCreate ----
\* Model of StoryService.create, not a second implementation.
\* Empty URL list -> IllegalArgumentException (phase = "rejected", saved stays FALSE).
\* ArticleFetchService returns OK or FAIL; FAIL is still stored on the story.
\* BiasDistributionService puts only LEFT, CENTER, and RIGHT in the bar.
EXTENDS Integers, Sequences, FiniteSets

CONSTANT MaxUrls
ASSUME MaxUrls \in Nat /\ MaxUrls >= 1

URLs == 1..MaxUrls
FetchResult == {"OK", "FAIL"}
Bias == {"LEFT", "CENTER", "RIGHT", "UNTRACKED"}

VARIABLES phase, urls, idx, articles, saved, bar

vars == <<phase, urls, idx, articles, saved, bar>>

Article == [url: URLs, fetch: FetchResult, bias: Bias]

Init ==
  /\ phase = "choose"
  /\ urls = <<>>
  /\ idx = 1
  /\ articles = <<>>
  /\ saved = FALSE
  /\ bar = {}

Choose(n) ==
  /\ phase = "choose"
  /\ n \in 0..MaxUrls
  /\ urls' = IF n = 0 THEN <<>> ELSE [i \in 1..n |-> i]
  /\ phase' = IF n = 0 THEN "rejected" ELSE "fetching"
  /\ UNCHANGED <<idx, articles, saved, bar>>

FetchStep ==
  /\ phase = "fetching"
  /\ idx <= Len(urls)
  /\ \E f \in FetchResult, b \in Bias:
       articles' = Append(articles, [url |-> urls[idx], fetch |-> f, bias |-> b])
  /\ idx' = idx + 1
  /\ UNCHANGED <<phase, urls, saved, bar>>

\* StoryService.save runs after every URL, including FAIL.
Save ==
  /\ phase = "fetching"
  /\ idx = Len(urls) + 1
  /\ phase' = "saved"
  /\ saved' = TRUE
  /\ bar' = {i \in DOMAIN articles : articles[i].bias # "UNTRACKED"}
  /\ UNCHANGED <<urls, idx, articles>>

Done ==
  /\ phase \in {"rejected", "saved"}
  /\ UNCHANGED vars

Next == (\E n \in 0..MaxUrls : Choose(n)) \/ FetchStep \/ Save \/ Done

Spec == Init /\ [][Next]_vars

TypeOK ==
  /\ phase \in {"choose", "fetching", "rejected", "saved"}
  /\ urls \in Seq(URLs)
  /\ Len(urls) <= MaxUrls
  /\ idx \in 1..(MaxUrls + 1)
  /\ articles \in Seq(Article)
  /\ saved \in BOOLEAN
  /\ bar \subseteq (1..MaxUrls)

EmptyRejected ==
  phase = "rejected" => /\ ~saved /\ urls = <<>> /\ articles = <<>>

FailDoesNotAbort ==
  phase = "saved" =>
    /\ saved
    /\ Len(articles) = Len(urls)
    /\ \A i \in 1..Len(urls) : articles[i].url = urls[i]

BarExcludesUntracked ==
  phase = "saved" => \A i \in bar : articles[i].bias # "UNTRACKED"

====
