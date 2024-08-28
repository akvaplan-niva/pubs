export interface CrossrefWorkMessage {
  message: CrossrefWork;
  status: string;
  "message-type": "work";
  "message-version": "1.0.0";
}

export interface CrossrefWork {
  indexed: Dates;
  "reference-count": number;
  publisher: string;
  issue: string;
  "content-domain": ContentDomain;
  "short-container-title": unknown[];
  "published-print": DateParts[];
  abstract: string;
  DOI: string;
  type: string;
  created: Dates;
  source: string;
  "is-referenced-by-count": number;
  title: string[];
  prefix: string;
  volume: string;
  author: Author[];
  member: string;
  "published-online": Dates;
  "container-title": string[];
  "original-title": unknown[];
  language: string;
  link: Link[];
  deposited: Dates;
  score: number;
  license: License[];
  resource: Resource;
  subtitle: string[];
  "short-title": string[];
  issued: Dates;
  "references-count": number;
  "journal-issue": JournalIssue;
  URL: URL;
  relation: unknown;
  ISSN: string[];
  "issn-type": IssnType[];
  subject: unknown[];
  published: Dates;
  reference: unknown[];
}

interface Author {
  given: string;
  family: string;

  name: string;
  sequence: string;
  affiliation: Affiliation[];
}

interface Affiliation {
  name: string;
}
interface ContentDomain {
  domain: unknown[];
  "crossmark-restriction": boolean;
}

interface DateParts {
  "date-parts": [[number, number, number]];
}
interface Dates extends DateParts {
  "date-time": Date;
  timestamp: number;
}

interface IssnType {
  value: string;
  type: string;
}

interface JournalIssue {
  issue: string;
  "published-online": Dates;
  "published-print": Dates;
}

interface Link {
  URL: URL;
  "content-type": string;
  "content-version": string;
  "intended-application": string;
}

interface License {
  start: Dates;
  "content-version": string;
  "delay-in-days": number;
  URL: string;
}

// interface Relation {}

interface Resource {
  primary: Primary;
}

interface Primary {
  URL: string;
}
