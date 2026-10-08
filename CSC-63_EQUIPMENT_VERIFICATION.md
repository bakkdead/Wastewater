# CSC-63 Equipment Recommendation Verification

## Purpose

This verification confirms that the final equipment recommendations and preliminary costs remain consistent with the wastewater skid calculation-engine requirements.

## Equipment Selection Assumptions

- Equipment recommendations are preliminary concept-level selections.
- Tanks are selected using the calculated required tank capacity in litres.
- The smallest available tank with capacity greater than or equal to the calculated requirement is selected.
- The transfer/feed pump is selected using the calculated required flow in m3/h.
- The dosing pump is selected using the calculated dosing requirement in L/h.
- Selected pumps must meet or exceed the calculated required capacity.
- Process and dosing pipe nominal sizes are retained from the calculation-engine output.
- Equipment prices are preliminary estimates in AUD and are not supplier quotations.
- Preliminary total equipment cost is the sum of the selected equipment prices.
- If no catalogue item fully satisfies a requirement, the closest available option is returned with a warning for engineering review.
- Final equipment selection remains subject to detailed engineering and supplier verification.

## SPN Design Case Verification

A complete SPN reference design case was passed through the calculation engine and equipment-selection module.

Verification covered:

- calculated tank requirements against selected tank capacities;
- calculated transfer-pump flow against selected pump capacity;
- calculated dosing requirement against selected dosing-pump capacity;
- process and dosing pipe requirements;
- preliminary individual equipment prices;
- total preliminary equipment cost;
- no-match warning behaviour; and
- retention of equipment recommendations in the final calculation output.

## Automated Verification Result

8 CSC-63 verification tests passed.

0 CSC-63 verification tests failed.

The tested equipment-selection and preliminary costing output is consistent with the calculation-engine requirements for the verified SPN design case.
