import { Router } from 'express';
import {
  getSurveyStatus,
  startSurvey,
  saveSurveyProgress,
  completeSurvey,
  getSurveyData,
  abortSurvey,
  listAllSurveys
} from '../controllers/surveysController';

const router = Router();

// GET /api/surveys - List all surveys (for debugging)
router.get('/', listAllSurveys);

// GET /api/surveys/:orderId/status - Get survey status for order
router.get('/:orderId/status', getSurveyStatus);

// GET /api/surveys/:orderId/data - Get survey data
router.get('/:orderId/data', getSurveyData);

// POST /api/surveys/:orderId/start - Start new survey
router.post('/:orderId/start', startSurvey);

// PUT /api/surveys/:orderId/progress - Save survey progress
router.put('/:orderId/progress', saveSurveyProgress);

// POST /api/surveys/:orderId/complete - Complete survey
router.post('/:orderId/complete', completeSurvey);

// DELETE /api/surveys/:orderId - Abort/delete survey
router.delete('/:orderId', abortSurvey);

export default router;