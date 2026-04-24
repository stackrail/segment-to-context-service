/**
 * Context Controller
 */

const {
  getUserContext: getUserContextQuery,
} = require('../../db/queries/context.query');

const getContextHandler = async (req, res, next) => {
  try {
    const { tenant_id, user_id } = req.query;

    if (!tenant_id || !user_id) {
      return res.status(400).json({
        error: 'tenant_id and user_id are required',
      });
    }

    const context = await getUserContextQuery(tenant_id, user_id);

    if (!context) {
      return res.status(404).json({
        error: 'User context not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: context,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getContextHandler,
};
