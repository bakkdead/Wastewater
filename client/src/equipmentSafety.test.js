import test from "node:test";
import assert from "node:assert/strict";
import {selectEquipment} from "./equipmentDatabase.js";
import {validate} from "./validation.js";
import {initialValues} from "./inputParameters.js";

test("million litre demand is not marked suitable", () => {
 const result=selectEquipment({tanks:{equalisationL:1000000,correctionL:1000,chemicalStorageL:500},pumps:{feedM3h:10,dosingLh:10}});
 assert.equal(result.allSuitable,false);
 assert.equal(result.selections.equalisationTank.suitable,false);
 assert.equal(result.selections.equalisationTank.item.capacityL,10000);
 assert.equal(result.preliminaryTotalCostAUD,null);
 assert.match(result.warnings.join(' '),/No suitable equipment found/);
});
test("arbitrary chemical rejected and acid/alkali mismatch rejected",()=>{
 const values={...initialValues,chemicalName:'SPN',chemicalType:'alkali'};
 assert.match(validate(values).chemicalName,/supported chemical/);
 values.chemicalName='Hydrochloric acid';
 assert.match(validate(values).chemicalName,/acid/);
});
