# NVA

## Documentation

https://github.com/BIBSYSDEV/nva-api-documentation

Test: https://swagger-ui.test.nva.aws.unit.no/

## Auth

https://github.com/BIBSYSDEV/nva-api-documentation/blob/main/scenarios/authenticating/index.md

## Search

### Institution filter

- https://api.test.nva.aws.unit.no/search/resources?category=AcademicArticle&institution=AKVAPLAN&size=0
- https://api.test.nva.aws.unit.no/search/resources?aggregation=all&from=0&results=10&order=relevance&sort=desc&institution=AKVAPLAN

### Hit keys

```sh
$ curl
"https://api.test.nva.aws.unit.no/search/resources?aggregation=all&from=0&results=1&order=relevance&sort=desc&institution=AKVAPLAN"
| nd-map '_keys=(o)=>log(Object.keys(o)), d.hits.map(_keys),undefined'
```

```json
[
  "type",
  "publicationContextUris",
  "@context",
  "id",
  "additionalIdentifiers",
  "contributorOrganizations",
  "createdDate",
  "curatingInstitutions",
  "entityDescription",
  "fundings",
  "identifier",
  "importDetail",
  "modelVersion",
  "modifiedDate",
  "projects",
  "publicationNotes",
  "publishedDate",
  "publisher",
  "resourceOwner",
  "status",
  "topLevelOrganizations",
  "filesStatus"
]
```

### Latest/NDJSON

NDJSON

```sh
$ curl "https://api.test.nva.aws.unit.no/search/resources?aggregation=none&from=0&results=100&order=publication_date&sort=desc&institution=AKVAPLAN" -H "accept: application/json" | nd-map 'nd=(o)=>log(stringify(o)),d.hits.map(nd),undefined' | nd-map 'd.entityDescription'
```

Articles NDJSON

```sh
$ curl "https://api.test.nva.aws.unit.no/search/resources?aggregation=none&from=0&results=100&order=publication_date&sort=desc&institution=AKVAPLAN&category=AcademicArticle" -H "accept: application/json" | nd-map 'nd=(o)=>log(stringify(o)),d.hits.map(nd),undefined' | nd-map 'd.entityDescription.reference' | nd-map '{doi,publicationContext}=d,{type,name}=publicationContext,{doi,container:name,containertype:type}'
```

Crossref

```sh
$ curl "https://api.test.nva.aws.unit.no/search/resources?aggregation=none&from=0&results=100&order=publication_date&sort=desc&institution=AKVAPLAN&category=AcademicArticle" -H "accept: application/json" | nd-map 'nd=(o)=>log(stringify(o)),d.hits.map(nd),undefined' | nd-map 'd.entityDescription.reference' | nd-map '{doi,publicationContext}=d,{type,name}=publicationContext,{doi,container:name,containertype:type}' | grep 'doi.org' | nd-map 'url = new URL(d.doi), url.hostname="api.crossref.org/works",url.pathname = "/works"+url.pathname,url' | nd-map 'r = await fetch(d), { status: r.status, work: d }'
```
