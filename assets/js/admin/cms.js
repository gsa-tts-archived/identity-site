import CMS from 'decap-cms';
import ProgramUpdatePreview from './program_update_preview.jsx';

CMS.registerPreviewTemplate('program_updates', ProgramUpdatePreview);

window.CMS = CMS;
