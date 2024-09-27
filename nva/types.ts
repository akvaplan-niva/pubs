// Convenience types, for official types, see:
// https://github.com/BIBSYSDEV/NVA-Frontend/tree/develop/src/types

export interface NvaEntityDescription {
  type: "EntityDescription";
  abstract: string;
  alternativeAbstracts: unknown;
  contributors: NvaContributor[];
  reference: NvaReference;
  language: string;
  mainTitle: string;
  publicationDate: PublicationDate;
}

export interface PublicationDate {
  type: "PublicationDate";
  year: string;
  month?: string;
  day?: string;
}

export interface NvaHitsGenerator {
  [Symbol.iterator](): Iterator<NvaPublication>;
}

export interface NvaPublication {
  type: "Publication";
  publicationContextUris: URL[];
  "@context": URL;
  id: string;
  additionalIdentifiers: NvaIdentifier[];
  associatedArtifacts: (NvaFile | NvaLink)[];
  contributorOrganizations: URL[];
  createdDate: Date;
  curatingInstitutions: URL[];
  entityDescription: NvaEntityDescription;
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

interface NvaIdentifier {
  type: string;
  value: URL | string;
  sourceName: string;
}

export interface NvaSearchResults {
  id: string;
  totalHits: number;
  hits: NvaPublication[];
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

export interface NvaFile {
  type: "PublishedFile" | "UnpublishableFile";
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
  id: URL | string;
}

export interface NvaLink {
  type: "AssociatedLink";
  id: URL | string;
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

export interface NvaContributor {
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

export interface NvaPublicationContext {
  id: string;
  type: string | string[];
  identifier: string;
  name: string;
  onlineIssn: string;
  sameAs: string;
  scientificValue: string;
  year: string;
  series: NvaChannel;
  disseminationChannel: string;
  entityDescription: NvaEntityDescription;
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
  type: string;
  doi: string;
  publicationContext: NvaPublicationContext;
}

interface Role {
  type: string;
}
