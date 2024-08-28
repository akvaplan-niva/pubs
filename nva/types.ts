// For official types, see:
// https://github.com/BIBSYSDEV/NVA-Frontend/tree/develop/src/types

export interface EntityDescription {
  type: "EntityDescription";
  abstract: string;
  alternativeAbstracts: unknown;
  contributors: Contributor[];
  reference: Reference;
  language: string;
  mainTitle: string;
  publicationDate: { type: "PublicationDate"; year: string };
}

export interface NvaHitsGenerator {
  [Symbol.iterator](): Iterator<NvaHit>;
}

export interface NvaHit {
  type: string;
  publicationContextUris: unknown;
  "@context": URL;
  id: unknown;
  additionalIdentifiers: unknown;
  associatedArtifacts: (PublishedFile | PublishedFile)[];
  contributorOrganizations: URL[];
  createdDate: Date;
  curatingInstitutions: URL[];
  entityDescription: EntityDescription;
  fundings: unknown;
  handle: string;
  identifier: string;
  importDetail: unknown[];
  modelVersion: unknown;
  modifiedDate: Date;
  publishedDate: Date;
  publisher: Organization;
  resourceOwner: unknown;
  status: string;
  topLevelOrganizations: unknown;
  filesStatus: unknown;
}
export interface NvaSearchResults {
  id: string;
  totalHits: number;
  hits: NvaHit[];
  nextResults: URL;
  nextSearchAfterResults: URL;
  "@context": URL;
}

export interface AccessTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: "Bearer";
}

export interface AccessTokenPayload {
  "token_use": "access";
  "scope": "string";
  "auth_time": number;
  "iss": string;
  "exp": number;
  "iat": number;
  "version": number;
  "jti": string;
  "client_id": string;
}

export interface AccessTokenObject extends AccessTokenResponse {
  id: string;
  url: URL | string;
  issued: Temporal.Instant | Date | string;
  expires: Temporal.Instant | Date | string;
}

interface PublishedFile {
  type: string;
  administrativeAgreement: boolean;
  identifier: string;
  license: License;
  mimeType: string;
  name: string;
  publishedDate: Date;
  publisherVersion: string;
  rightsRetentionStrategy: RightsRetentionStrategy;
  size: number;
  uploadDetails: UploadDetails;
  visibleForNonOwner: boolean;
}

interface License {
  type: string;
  value: string;
  name: string;
  labels: IntlString;
}

interface RightsRetentionStrategy {
  type: string;
  configuredType: string;
}

interface UploadDetails {
  type: string;
  uploadedBy: string;
  uploadedDate: Date;
}

interface Contributor {
  type: "Contributor";
  affiliations: unknown[];
  correspondingAuthor: boolean;
  identity: Identity;
  role: Role;
  sequence: number;
}

interface Identity {
  type: "Identity";
  name: string;
  verificationStatus: string;
}

interface IntlString {
  [lang: string]: string;
}

interface Organization {
  "@context": string;
  type: "Organization";
  id: URL;
  labels: IntlString;
  acronym: string;
  country: string;
  countryCode: string;

  partOf: Organization[];
  hasPart: Organization[];
}

interface PublicationContext {
  id: string;
  type: string;
  identifier: string;
  name: string;
  onlineIssn: string;
  sameAs: string;
  scientificValue: string;
  year: string;
}

interface Reference {
  type: string;
  doi: string;
  publicationContext: PublicationContext;
}

interface Role {
  type: string;
}
