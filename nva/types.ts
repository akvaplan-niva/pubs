// Convenience types, for official types, see:
// https://github.com/BIBSYSDEV/NVA-Frontend/tree/develop/src/types

export interface NvaPublication {
  type: string | "Publication";
  publicationContextUris: (URL | string)[];
  "@context": URL | string;
  id: string;
  additionalIdentifiers: NvaIdentifier[];
  associatedArtifacts?: (NvaFile | NvaLink)[];
  contributorOrganizations: (URL | string)[];
  createdDate: Date | string;
  curatingInstitutions: (URL | string)[];
  entityDescription: NvaEntityDescription;
  fundings: NvaFunder[];
  projects: NvaProject[];
  handle?: string;
  identifier: string;
  importDetail: unknown[];
  modelVersion: unknown;
  modifiedDate: Date | string;
  publishedDate: Date | string;
  publisher: NvaOrganization;
  resourceOwner: unknown;
  status: string;
  topLevelOrganizations: unknown;
  filesStatus: unknown;
}

export interface NvaEntityDescription {
  type: string | "EntityDescription";
  abstract?: string;
  alternativeAbstracts: unknown;
  contributors: NvaContributor[];
  reference: NvaReference;
  language: string;
  mainTitle: string;
  publicationDate: NvaPublicationDate;
}

export interface NvaFunder {
  type: string;
  id: string;
  identifier: string;
  labels?: IntlString;
  name?: IntlString;
  "@context"?: NvaFunderContext;
}

export interface NvaProject {
  type: string;
  id: string;
  name?: string;
  title?: string;
  startDate?: Date | string;
  endDate?: Date | string;
  coordinatingInstitution?: NvaOrganization;
}

export interface NvaFunderContext {
  "@vocab": string;
  id: string;
  type: string;
  labels: NvaContextLabels;
}

export interface NvaContextLabels {
  "@id": string;
  "@container": string;
}
export interface NvaPublicationDate {
  type: string | "PublicationDate";
  year: string;
  month?: string;
  day?: string;
}

export interface NvaHitsGenerator {
  [Symbol.iterator](): Iterator<NvaPublication>;
}

interface NvaIdentifier {
  type: string;
  value: URL | string;
  sourceName: string;
}

export interface NvaSearchResults {
  id: string;
  totalHits: number;
  hits: NvaPublication[];
  nextResults: URL | string;
  nextSearchAfterResults: URL | string;
  "@context": URL | string;
}

export interface AccessTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string | "Bearer";
}

export interface AccessTokenPayload {
  token_use: "access";
  scope: "string";
  auth_time: number;
  iss: string;
  exp: number;
  iat: number;
  version: number;
  jti: string;
  client_id: string;
}

export interface AccessTokenObject extends AccessTokenResponse {
  id: string;
  url: URL | string;
  issued: Temporal.Instant | Date | string;
  expires: Temporal.Instant | Date | string;
}

export interface NvaFile {
  type: string | "PublishedFile" | "UnpublishableFile";
  administrativeAgreement: boolean;
  identifier: string;
  license: NvaLicense;
  mimeType: string;
  name: string;
  publishedDate: Date;
  publisherVersion: string;
  rightsRetentionStrategy: NvaRightsRetentionStrategy;
  size: number;
  uploadDetails: NvaUploadDetails;
  visibleForNonOwner: boolean;
  id: URL | string;
}

export interface NvaLink {
  type: string | "AssociatedLink";
  id: URL | string;
}
interface NvaLicense {
  type: string;
  value: string;
  name: string;
  labels: IntlString;
}

interface NvaRightsRetentionStrategy {
  type: string;
  configuredType: string;
}

interface NvaUploadDetails {
  type: string;
  uploadedBy: string;
  uploadedDate: Date;
}

export interface NvaContributor {
  type: string | "Contributor";
  affiliations?: unknown[];
  correspondingAuthor: boolean;
  identity: NvaIdentity;
  role: NvaRole;
  sequence: number;
}

interface NvaIdentity {
  type: string | "Identity";
  name: string;
  verificationStatus: string;
}

interface IntlString {
  [lang: string]: string;
}

interface NvaOrganization {
  "@context"?: string;
  type: string | "Organization";
  id: URL | string;
  labels?: IntlString;
  acronym?: string;
  country?: string;
  countryCode?: string;

  partOf?: NvaOrganization[];
  hasPart?: NvaOrganization[];
}

export interface NvaPublicationContext {
  id?: string;
  type: string | string[];
  identifier?: string;
  name?: string;
  onlineIssn?: string;
  sameAs?: string;
  scientificValue?: string;
  year?: string;
  series?: NvaChannel;
  disseminationChannel?: string;
  entityDescription?: NvaEntityDescription;
  publisher?: NvaPublisher;
  agent?: NvaAgent;
  label?: string;
  place?: unknown;
  time: NvaTime;
}

interface NvaPublisher {
  name: string;
  id: string;
}

export interface NvaTime {
  from: string;
  to?: string;
}

interface NvaAgent {
  name: string;
  type: string;
}

export interface NvaPublicationInstance {
  pages?: NvaPages;
  type: string;
}

export interface NvaPages {
  end?: string;
  type: string;
  begin?: string;
}

export interface NvaChannel {
  id: string;
  type: string;
  identifier: string;
  name: string;
  printIssn: string;
  sameAs: string;
  scientificValue: string;
  year: string;
}

export interface NvaReference {
  type: string | "Reference";
  doi?: string;
  publicationInstance: NvaPublicationInstance;
  publicationContext: NvaPublicationContext;
}

interface NvaRole {
  type: string;
}
