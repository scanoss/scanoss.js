## SDK - gRPC Services

This
directory
contains
the
gRPC
services
used
by
the
CLI.
In
this
section,
you'll
find
examples
of
how
to
use
them
in
your
own
project.

For
more
information,
visit
the
repository
where
the
protobufs
are
defined: https://github.com/scanoss/papi

### Cryptography Service

The
cryptography
service
allows
you
to
discover
algorithms
used
by
a
component.
Below
is
an
example
of
how
to
use
this
service.

#### Usage Example

Here's
how
you
can
use
the
Cryptography
Service
to
retrieve
available
cryptography
algorithms:

```typescript
import {
  CryptographyService,
  PurlRequest
} from 'scanoss'

async function main() {
  const purlRequest: PurlRequest = {
    purlsList: [{
      purl: "pkg:npm/scanoss/scanoss.js"
    }]
  }

  const crypto = new CryptographyService("<your_scanoss_token>");
  const algorithm = await crypto.getAlgorithms(purlRequest);
  console.log(JSON.stringify(algorithm));
}

main();
```

### Dependency Scanning

```typescript
import {
  DependencyScanner,
  DependencyScannerCfg
} from "scanoss";

const main = async () => {

  const dependencyScanner = new DependencyScanner();

  //Scan a full folder
  const results = await dependencyScanner.scanFolder("./node_modules")

  //Scan specific files
  //const results = await dependencyScanner.scan(["./package.json", "package-lock.json"])

}

main();
```
