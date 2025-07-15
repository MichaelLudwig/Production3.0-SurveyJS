import { Router } from 'express';
import {
  getSurveyDefinition,
  getValidationGroups
} from '../controllers/masterDataController';

const router = Router();

// GET /api/master-data/survey-definition - Get survey definition
router.get('/survey-definition', getSurveyDefinition);

// GET /api/master-data/validation-groups - Get validation groups
router.get('/validation-groups', getValidationGroups);

export default router;