const AiService = require('../services/aiService');
const ApiResponse = require('../utils/apiResponse');

const predictYield = async (req, res, next) => {
  try {
    const prediction = await AiService.predictMilkYield(req.body || {});
    return ApiResponse.success(res, prediction, 'AI yield prediction completed');
  } catch (error) {
    next(error);
  }
};

const analyzeDiseaseRisk = async (req, res, next) => {
  try {
    const analysis = await AiService.evaluateDiseaseRisk(req.body || {});
    return ApiResponse.success(res, analysis, 'AI health risk analysis completed');
  } catch (error) {
    next(error);
  }
};

const getFeedRecommendation = async (req, res, next) => {
  try {
    const recommendation = await AiService.getFeedOptimization(req.query || {});
    return ApiResponse.success(res, recommendation, 'AI feed optimization generated');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  predictYield,
  analyzeDiseaseRisk,
  getFeedRecommendation,
};
