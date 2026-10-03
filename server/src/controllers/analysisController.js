import { ReleaseRepository } from '../repositories/releaseRepository.js';
import { AiService } from '../services/aiService.js';

export class AnalysisController {
  constructor(releaseRepo = null, aiService = null) {
    this.releaseRepo = releaseRepo || new ReleaseRepository();
    this.aiService = aiService || new AiService();
  }

  analyze = async (req, res, next) => {
    try {
      const { releaseId } = req.params;
      const release = this.releaseRepo.getById(releaseId);
      if (!release) {
        return res.status(404).json({ error: { message: `Release "${releaseId}" not found.`, code: 'NOT_FOUND' } });
      }

      const result = await this.aiService.analyzeRelease(release);
      res.json({ analysis: result });
    } catch (err) {
      next(err);
    }
  };

  getStatus = (req, res, next) => {
    try {
      const isConfigured = this.aiService.geminiProvider.isConfigured();
      res.json({
        provider: 'Google Gemini',
        configured: isConfigured,
        model: process.env.GEMINI_MODEL || 'gemini-2.5-flash'
      });
    } catch (err) {
      next(err);
    }
  };
}
