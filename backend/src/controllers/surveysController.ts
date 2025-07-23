import { Request, Response, NextFunction } from 'express';
import { 
  SurveyFile, 
  SurveyStatus, 
  ApiResponse, 
  SaveSurveyProgressRequest, 
  CompleteSurveyRequest 
} from '../types';
import { 
  readJsonFile, 
  writeJsonFile, 
  listSurveyFiles, 
  deleteSurveyFile, 
  getSurveyFilePath,
  fileExists,
  getFileStats
} from '../utils/fileOperations';

/**
 * Get survey status for a specific order
 */
export async function getSurveyStatus(
  req: Request,
  res: Response<ApiResponse<SurveyStatus>>,
  next: NextFunction
): Promise<void> {
  try {
    const { orderId } = req.params;
    console.log(`[Surveys] GET /api/surveys/${orderId}/status`);
    
    // Check for in-progress survey
    const inProgressPath = getSurveyFilePath(orderId, 'inprogress');
    const hasInProgress = await fileExists(inProgressPath);
    
    if (hasInProgress) {
      const stats = await getFileStats(inProgressPath);
      const surveyData: SurveyFile = await readJsonFile(inProgressPath);
      
      res.json({
        success: true,
        data: {
          exists: true,
          status: 'in_progress',
          lastModified: stats.mtime.toISOString(),
          currentPageNo: surveyData.currentPageNo || 0
        }
      });
      return;
    }
    
    // Check for completed surveys
    const completedFiles = await listSurveyFiles(orderId);
    const completedSurveys = completedFiles.filter(f => 
      !f.includes('-inprogress.json') && f.includes(`survey-${orderId}-`)
    );
    
    if (completedSurveys.length > 0) {
      // Get the most recent completed survey
      const latestFile = completedSurveys.sort().reverse()[0];
      const stats = await getFileStats(`surveys/${latestFile}`);
      
      res.json({
        success: true,
        data: {
          exists: true,
          status: 'completed',
          lastModified: stats.mtime.toISOString()
        }
      });
      return;
    }
    
    // No survey found
    res.json({
      success: true,
      data: {
        exists: false
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Start a new survey for an order
 */
export async function startSurvey(
  req: Request,
  res: Response<ApiResponse<SurveyFile>>,
  next: NextFunction
): Promise<void> {
  try {
    const { orderId } = req.params;
    console.log(`[Surveys] POST /api/surveys/${orderId}/start`);
    
    // Check if survey already exists
    const inProgressPath = getSurveyFilePath(orderId, 'inprogress');
    const hasInProgress = await fileExists(inProgressPath);
    
    if (hasInProgress) {
      // Return existing survey
      const existingSurvey: SurveyFile = await readJsonFile(inProgressPath);
      res.json({
        success: true,
        data: existingSurvey,
        message: 'Survey already exists, returning existing data'
      });
      return;
    }
    
    // Create new survey
    const newSurvey: SurveyFile = {
      orderId,
      timestamp: new Date().toISOString(),
      status: 'in_progress',
      answers: {},
      auditTrail: {},
      currentPageNo: 0,
      ma2Completions: {},
      pendingMA2Groups: []
    };
    
    await writeJsonFile(inProgressPath, newSurvey);
    
    console.log(`[Surveys] Started new survey for order ${orderId}`);
    
    res.status(201).json({
      success: true,
      data: newSurvey,
      message: 'Survey started successfully'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Save survey progress
 */
export async function saveSurveyProgress(
  req: Request<{ orderId: string }, ApiResponse<SurveyFile>, SaveSurveyProgressRequest>,
  res: Response<ApiResponse<SurveyFile>>,
  next: NextFunction
): Promise<void> {
  try {
    const { orderId } = req.params;
    const { data, enhancedData, ma2Completions, pendingMA2Groups, currentPageNo } = req.body;
    
    console.log(`[Surveys] PUT /api/surveys/${orderId}/progress - Page ${currentPageNo}`);
    console.log(`[Surveys] 🔥 Received data structure:`, JSON.stringify(req.body, null, 2));
    
    const inProgressPath = getSurveyFilePath(orderId, 'inprogress');
    
    // Load existing survey or create new one
    let surveyData: SurveyFile;
    try {
      surveyData = await readJsonFile(inProgressPath);
    } catch {
      // Create new survey if it doesn't exist - nur neue Struktur
      surveyData = {
        orderId,
        timestamp: new Date().toISOString(),
        status: 'in_progress',
        survey: {},
        validation: {}
      };
    }
    
    // Update survey data - nur neue saubere Struktur
    const updatedSurvey: SurveyFile = {
      orderId,
      timestamp: new Date().toISOString(),
      status: 'in_progress',
      // Nur neue Struktur verwenden
      survey: (req.body as any).survey || enhancedData || {},
      validation: (req.body as any).validation || {},
      currentPageNo
      // Legacy-Felder entfernt - nur neue Struktur
    };
    
    await writeJsonFile(inProgressPath, updatedSurvey);
    
    res.json({
      success: true,
      data: updatedSurvey,
      message: 'Progress saved successfully'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Complete a survey
 */
export async function completeSurvey(
  req: Request<{ orderId: string }, ApiResponse, CompleteSurveyRequest>,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> {
  try {
    const { orderId } = req.params;
    const { answers, auditTrail, productionOrder, completedAt } = req.body;
    
    console.log(`[Surveys] PUT /api/surveys/${orderId}/complete`);
    console.log(`[Surveys] Received data:`, { 
      hasAnswers: !!answers, 
      hasAuditTrail: !!auditTrail,
      hasProductionOrder: !!productionOrder,
      completedAt 
    });
    
    const timestamp = completedAt || new Date().toISOString().replace(/[:.]/g, '-');
    const completedPath = getSurveyFilePath(orderId, 'completed', timestamp);
    const inProgressPath = getSurveyFilePath(orderId, 'inprogress');
    
    // Create completed survey file with full data structure
    const completedSurvey: SurveyFile = {
      orderId,
      timestamp: new Date().toISOString(),
      status: 'completed',
      survey: answers, // Frontend sends as 'answers', we store as 'survey'
      validation: auditTrail, // Frontend sends as 'auditTrail', we store as 'validation'
      productionOrder: productionOrder // Include production order data
    };
    
    await writeJsonFile(completedPath, completedSurvey);
    console.log(`[Surveys] Saved completed survey to: ${completedPath}`);
    
    // Remove in-progress file
    try {
      await deleteSurveyFile(`survey-${orderId}-inprogress.json`);
      console.log(`[Surveys] Deleted in-progress file for order ${orderId}`);
    } catch (error) {
      console.warn(`[Surveys] Could not delete in-progress file: ${error}`);
    }
    
    // Update order status to completed
    try {
      const ordersPath = 'data/orders/orders.json';
      const orders = await readJsonFile(ordersPath);
      const orderIndex = orders.findIndex((order: any) => order.id === parseInt(orderId));
      
      if (orderIndex !== -1) {
        orders[orderIndex].status = 'completed';
        orders[orderIndex].completedAt = new Date().toISOString();
        await writeJsonFile(ordersPath, orders);
        console.log(`[Surveys] Updated order ${orderId} status to completed`);
      }
    } catch (error) {
      console.warn(`[Surveys] Could not update order status: ${error}`);
    }
    
    console.log(`[Surveys] Completed survey for order ${orderId}`);
    
    res.json({
      success: true,
      message: 'Survey completed successfully'
    });
  } catch (error) {
    console.error(`[Surveys] Error completing survey:`, error);
    next(error);
  }
}

/**
 * Get survey data (in-progress or completed)
 */
export async function getSurveyData(
  req: Request,
  res: Response<ApiResponse<SurveyFile>>,
  next: NextFunction
): Promise<void> {
  try {
    const { orderId } = req.params;
    console.log(`[Surveys] GET /api/surveys/${orderId}/data`);
    
    // Try in-progress first
    const inProgressPath = getSurveyFilePath(orderId, 'inprogress');
    const hasInProgress = await fileExists(inProgressPath);
    
    if (hasInProgress) {
      const surveyData: SurveyFile = await readJsonFile(inProgressPath);
      res.json({
        success: true,
        data: surveyData
      });
      return;
    }
    
    // Try most recent completed survey
    const completedFiles = await listSurveyFiles(orderId);
    const completedSurveys = completedFiles.filter(f => 
      !f.includes('-inprogress.json') && f.includes(`survey-${orderId}-`)
    );
    
    if (completedSurveys.length > 0) {
      const latestFile = completedSurveys.sort().reverse()[0];
      const surveyData: SurveyFile = await readJsonFile(`surveys/${latestFile}`);
      res.json({
        success: true,
        data: surveyData
      });
      return;
    }
    
    res.status(404).json({
      success: false,
      error: 'Survey not found',
      message: `No survey data found for order ${orderId}`
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Abort/delete a survey
 */
export async function abortSurvey(
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> {
  try {
    const { orderId } = req.params;
    console.log(`[Surveys] DELETE /api/surveys/${orderId}`);
    
    const inProgressPath = getSurveyFilePath(orderId, 'inprogress');
    const hasInProgress = await fileExists(inProgressPath);
    
    if (hasInProgress) {
      await deleteSurveyFile(`survey-${orderId}-inprogress.json`);
      console.log(`[Surveys] Aborted survey for order ${orderId}`);
      
      res.json({
        success: true,
        message: 'Survey aborted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Survey not found',
        message: `No in-progress survey found for order ${orderId}`
      });
    }
  } catch (error) {
    next(error);
  }
}

/**
 * List all surveys (for debugging)
 */
export async function listAllSurveys(
  req: Request,
  res: Response<ApiResponse<string[]>>,
  next: NextFunction
): Promise<void> {
  try {
    console.log(`[Surveys] GET /api/surveys`);
    
    const allFiles = await listSurveyFiles();
    
    res.json({
      success: true,
      data: allFiles
    });
  } catch (error) {
    next(error);
  }
}