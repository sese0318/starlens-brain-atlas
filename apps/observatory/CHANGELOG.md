# Code release history

These entries describe capabilities when published, not when the underlying scientific research was performed. Earlier Git tags remain unchanged.

## Parcel 04: complete local interface

Included a detailed methods and results report and corrected the evidence export version to 0.4.0. Final candidate checks passed: 26 JavaScript tests, 16 Python tests, the production build and ten browser workflow checks.

Added the existing React views and components, local import controls and evidence export, with a dedicated prototype.html entry and locked installation dependencies. The interface uses the calculation and validation modules from the earlier parcels. Publishing the source does not replace the public presentation website.

## Parcel 03: validated input to the same comparison

Added local bundle validation and the audited aggregate converter. The comparison command connects those inputs to the existing map ranking. Regression tests require the portable result to stay identical to parcel 01 and reject invalid input before printing a result. The converter and validator originate in the earlier local prototype; the command and integration tests were added during this release review.

## Parcel 02: interpretation and numerical reference

Published at `parcel-02`: conditional state functions, runnable state comparison, independent Python reference and model tests.

Numerical review in version 0.2.1: require all six model inputs; reject nonfinite calculated results; compute threshold time without an overflowing intermediate ratio. Added regression cases and clarified the distinction between the two synthetic regional fixtures.

## Parcel 01: regional comparison

Published the synthetic generator, map ranking, sensitivity calculation, command line example and initial tests. Subsequent website and schedule edits did not add analysis functionality; they are not counted as another code parcel.
