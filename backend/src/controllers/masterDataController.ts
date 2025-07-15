import { Request, Response, NextFunction } from 'express';
import { ValidationGroup, ApiResponse } from '../types';
import { readJsonFile } from '../utils/fileOperations';

/**
 * Get survey definition (surveyDefinition.json)
 */
export async function getSurveyDefinition(
  req: Request,
  res: Response<ApiResponse<any>>,
  next: NextFunction
): Promise<void> {
  try {
    console.log('[MasterData] GET /api/master-data/survey-definition');
    
    const surveyDefinition = await readJsonFile('master-data/surveyDefinition.json');
    
    res.json({
      success: true,
      data: surveyDefinition
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get validation groups (validationGroups.json)
 */
export async function getValidationGroups(
  req: Request,
  res: Response<ApiResponse<ValidationGroup[]>>,
  next: NextFunction
): Promise<void> {
  try {
    console.log('[MasterData] GET /api/master-data/validation-groups');
    
    const validationGroups = await readJsonFile('master-data/validationGroups.json');
    
    res.json({
      success: true,
      data: validationGroups
    });
  } catch (error) {
    next(error);
  }
}