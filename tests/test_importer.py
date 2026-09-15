"""Exercise the importer with temporary invented CSVs, never research records."""
import csv,hashlib,importlib.util,math,tempfile,unittest
from pathlib import Path
from unittest.mock import patch
spec=importlib.util.spec_from_file_location('aggregate_importer',Path(__file__).resolve().parents[1]/'scripts/import_research_aggregates.py')
module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
class ImporterTests(unittest.TestCase):
 def fixture(self,root):
  rois=[f'{side}_fixture{i}' for side in ['l','r'] for i in range(41)]
  tables={'outputs/atrophy_data.csv':[['ROI']+module.CONTRASTS]+[[roi,0.1,0.2,0.3,0.4] for roi in rois], 'parcellated_petfiles.csv':[['File']+rois+['brainstem']]+[[f'fixture_{i}']+[i/100]*83 for i in range(30)]}
  for name,rows in tables.items():
   p=root/name;p.parent.mkdir(parents=True,exist_ok=True)
   with p.open('w',newline='') as f:csv.writer(f).writerows(rows)
  return {name:hashlib.sha256((root/name).read_bytes()).hexdigest() for name in tables}
 def test_invented_fixture_preserves_alignment_and_excludes_brainstem(self):
  with tempfile.TemporaryDirectory() as temp:
   root=Path(temp);pins=self.fixture(root)
   with patch.object(module,'EXPECTED',pins):result=module.build(root)
   self.assertEqual(len(result['regions']),82);self.assertEqual(len(result['profiles']),4);self.assertEqual(len(result['maps']),30)
   self.assertEqual(result['profiles'][0]['values'],[0.1]*82)
   self.assertEqual(result['maps'][2]['values'],[0.02]*82)
 def test_changed_content_fails_the_hash_gate(self):
  with tempfile.TemporaryDirectory() as temp:
   root=Path(temp);pins=self.fixture(root)
   with (root/'outputs/atrophy_data.csv').open('a') as f:f.write('unexpected')
   with patch.object(module,'EXPECTED',pins),self.assertRaisesRegex(ValueError,'hash differs'):module.build(root)
 def test_reordered_regions_fail_even_with_matching_file_hash(self):
  with tempfile.TemporaryDirectory() as temp:
   root=Path(temp);pins=self.fixture(root);p=root/'parcellated_petfiles.csv'
   with p.open() as f:rows=list(csv.reader(f))
   rows[0][1],rows[0][2]=rows[0][2],rows[0][1]
   with p.open('w',newline='') as f:csv.writer(f).writerows(rows)
   pins['parcellated_petfiles.csv']=hashlib.sha256(p.read_bytes()).hexdigest()
   with patch.object(module,'EXPECTED',pins),self.assertRaisesRegex(ValueError,'identities and order'):module.build(root)
 def test_nonfinite_values_are_rejected(self):
  for value in ['nan','inf','-inf']:
   with self.assertRaisesRegex(ValueError,'Nonfinite'):module.finite_values(['1',value])
if __name__=='__main__':unittest.main()
