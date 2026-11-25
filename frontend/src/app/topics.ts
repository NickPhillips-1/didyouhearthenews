export interface Subtopic {
  id: string;
  label: string;
  keywords: string[];
}

export interface TopicGroup {
  label: string;
  subtopics: Subtopic[];
}

export interface Topic {
  id: string;
  label: string;
  keywords: string[];
  groups: TopicGroup[];
}

/** Query value is omitted for this id so the default URL stays clean. */
export const FOR_YOU_TOPIC_ID = 'all';

export const TOPICS: Topic[] = [
  { id: FOR_YOU_TOPIC_ID, label: 'For you', keywords: [], groups: [] },
  topic('us', 'U.S.', [
    group('Government', [
      sub('congress', 'Congress', ['congress']),
      sub('white-house', 'White House', ['white house']),
      sub('federal', 'Federal', ['federal'])
    ]),
    group('States', [
      sub('senate', 'Senate', ['senate']),
      sub('america', 'America', ['america'])
    ])
  ]),
  topic('politics', 'Politics', [
    group('Elections', [
      sub('elections', 'Elections', ['election']),
      sub('campaigns', 'Campaigns', ['campaign']),
      sub('voting', 'Voting', ['vote', 'voting'])
    ]),
    group('Parties', [
      sub('democrats', 'Democrats', ['democrat']),
      sub('republicans', 'Republicans', ['republican']),
      sub('trump', 'Trump', ['trump'])
    ]),
    group('Washington', [
      sub('congress', 'Congress', ['congress']),
      sub('senate', 'Senate', ['senate']),
      sub('white-house', 'White House', ['white house'])
    ])
  ]),
  topic('world', 'World', [
    group('Conflicts', [
      sub('war', 'War', ['war']),
      sub('ukraine', 'Ukraine', ['ukraine']),
      sub('gaza', 'Gaza', ['gaza'])
    ]),
    group('Regions', [
      sub('china', 'China', ['china']),
      sub('europe', 'Europe', ['europe']),
      sub('israel', 'Israel', ['israel'])
    ]),
    group('Alliances', [sub('nato', 'NATO', ['nato'])])
  ]),
  topic('business', 'Business', [
    group('Markets', [
      sub('markets', 'Markets', ['market']),
      sub('stocks', 'Stocks', ['stock']),
      sub('inflation', 'Inflation', ['inflation'])
    ]),
    group('Companies', [
      sub('companies', 'Companies', ['company']),
      sub('banks', 'Banks', ['bank']),
      sub('trade', 'Trade', ['trade'])
    ]),
    group('Economy', [sub('economy', 'Economy', ['economy'])])
  ]),
  topic('technology', 'Technology', [
    group('AI', [sub('ai', 'AI', ['ai'])]),
    group('Companies', [
      sub('apple', 'Apple', ['apple']),
      sub('google', 'Google', ['google'])
    ]),
    group('Products', [
      sub('software', 'Software', ['software']),
      sub('tech', 'Tech', ['tech'])
    ])
  ]),
  topic('health', 'Health', [
    group('Care', [
      sub('health', 'Health', ['health']),
      sub('hospitals', 'Hospitals', ['hospital'])
    ]),
    group('Medicine', [
      sub('vaccines', 'Vaccines', ['vaccine']),
      sub('fda', 'FDA', ['fda']),
      sub('drugs', 'Drugs', ['drug'])
    ])
  ]),
  topic('opinion', 'Opinion', [
    group('Commentary', [
      sub('opinion', 'Opinion', ['opinion']),
      sub('editorial', 'Editorial', ['editorial']),
      sub('columnist', 'Columnist', ['columnist'])
    ]),
    group('Voices', [
      sub('commentary', 'Commentary', ['commentary']),
      sub('op-ed', 'Op-ed', ['op-ed', 'oped'])
    ])
  ]),
  topic('science', 'Science', [
    group('Research', [
      sub('science', 'Science', ['science']),
      sub('research', 'Research', ['research']),
      sub('scientist', 'Scientist', ['scientist'])
    ]),
    group('Space', [
      sub('nasa', 'NASA', ['nasa']),
      sub('space', 'Space', ['space']),
      sub('mars', 'Mars', ['mars'])
    ]),
    group('Biology', [
      sub('biology', 'Biology', ['biology']),
      sub('genome', 'Genome', ['genome'])
    ])
  ]),
  topic('climate', 'Climate', [
    group('Climate', [
      sub('climate', 'Climate', ['climate']),
      sub('warming', 'Warming', ['warming'])
    ]),
    group('Environment', [
      sub('wildfire', 'Wildfire', ['wildfire']),
      sub('pollution', 'Pollution', ['pollution']),
      sub('emissions', 'Emissions', ['emission'])
    ])
  ]),
  topic('sports', 'Sports', [
    group('Leagues', [
      sub('nfl', 'NFL', ['nfl']),
      sub('nba', 'NBA', ['nba']),
      sub('mlb', 'MLB', ['mlb']),
      sub('nhl', 'NHL', ['nhl'])
    ]),
    group('Games', [
      sub('football', 'Football', ['football']),
      sub('basketball', 'Basketball', ['basketball']),
      sub('baseball', 'Baseball', ['baseball']),
      sub('soccer', 'Soccer', ['soccer'])
    ]),
    group('Events', [
      sub('olympics', 'Olympics', ['olympic']),
      sub('championship', 'Championship', ['championship'])
    ])
  ]),
  topic('entertainment', 'Entertainment', [
    group('Screen', [
      sub('movies', 'Movies', ['movie']),
      sub('film', 'Film', ['film']),
      sub('hollywood', 'Hollywood', ['hollywood']),
      sub('television', 'Television', ['television'])
    ]),
    group('Music', [
      sub('music', 'Music', ['music']),
      sub('album', 'Album', ['album']),
      sub('concert', 'Concert', ['concert'])
    ]),
    group('Awards', [
      sub('oscar', 'Oscar', ['oscar']),
      sub('grammy', 'Grammy', ['grammy']),
      sub('emmy', 'Emmy', ['emmy'])
    ])
  ]),
  topic('education', 'Education', [
    group('Schools', [
      sub('school', 'School', ['school']),
      sub('university', 'University', ['university']),
      sub('college', 'College', ['college'])
    ]),
    group('Campus', [
      sub('student', 'Student', ['student']),
      sub('campus', 'Campus', ['campus']),
      sub('education', 'Education', ['education'])
    ])
  ]),
  topic('lifestyle', 'Lifestyle', [
    group('Food', [
      sub('restaurant', 'Restaurant', ['restaurant']),
      sub('recipe', 'Recipe', ['recipe']),
      sub('chef', 'Chef', ['chef'])
    ]),
    group('Travel', [
      sub('travel', 'Travel', ['travel']),
      sub('airline', 'Airline', ['airline']),
      sub('hotel', 'Hotel', ['hotel'])
    ]),
    group('Style', [
      sub('fashion', 'Fashion', ['fashion']),
      sub('style', 'Style', ['style'])
    ])
  ])
];

/** Unknown topic ids show every story. An unknown subtopic falls back to its chip. */
export function storyMatchesTopic(title: string, topicId: string, subtopicId?: string | null): boolean {
  const topic = TOPICS.find((item) => item.id === topicId);
  if (!topic || topic.keywords.length === 0) {
    return true;
  }
  const keywords = findSubtopic(topicId, subtopicId)?.keywords ?? topic.keywords;
  const haystack = title.toLowerCase();
  return keywords.some((keyword) => containsKeyword(haystack, keyword.toLowerCase()));
}

export function topicLabel(topicId: string, subtopicId?: string | null): string {
  return findSubtopic(topicId, subtopicId)?.label
    ?? TOPICS.find((item) => item.id === topicId)?.label
    ?? 'For you';
}

export function findSubtopic(topicId: string, subtopicId?: string | null): Subtopic | undefined {
  if (!subtopicId) {
    return undefined;
  }
  const topic = TOPICS.find((item) => item.id === topicId);
  for (const column of topic?.groups ?? []) {
    const match = column.subtopics.find((item) => item.id === subtopicId);
    if (match) {
      return match;
    }
  }
  return undefined;
}

function topic(id: string, label: string, groups: TopicGroup[]): Topic {
  const keywords = [...new Set(groups.flatMap((column) => column.subtopics.flatMap((item) => item.keywords)))];
  return { id, label, keywords, groups };
}

function group(label: string, subtopics: Subtopic[]): TopicGroup {
  return { label, subtopics };
}

function sub(id: string, label: string, keywords: string[]): Subtopic {
  return { id, label, keywords };
}

function containsKeyword(haystack: string, keyword: string): boolean {
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Short tokens must be whole words so "ai" does not match "against".
  if (keyword.length <= 3) {
    return new RegExp(`(?:^|[^a-z0-9])${escaped}(?:$|[^a-z0-9])`, 'i').test(haystack);
  }
  return haystack.includes(keyword);
}
