const TwoFAService = require("../services/FAService");

const twoFAController = {
  async enable2FA(req, res) {
    const { id: userId } = req.params;
    const result = await TwoFAService.enable2FA(userId);
    res.status(result.success ? 200 : 404).json(result);
  },

  async disable2FA(req, res) {
    const { id: userId } = req.params;
    const result = await TwoFAService.disable2FA(userId);
    res.status(result.success ? 200 : 404).json(result);
  },

  async verify2FA(req, res) {
    const { id: userId } = req.params;
    const { token } = req.body;
    const result = await TwoFAService.verify2FA(userId, token);
    res.status(result.success ? 200 : 400).json(result);
  },
};

module.exports = twoFAController;
