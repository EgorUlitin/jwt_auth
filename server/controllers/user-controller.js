const ApiError = require('../exceptions/api-error');
const userServices = require('../services/user-service');
const { validationResult } = require('express-validator');

class UserController {
	async registration(req, res, next) {
		try {
			const errors = validationResult(req);

			if (!errors.isEmpty()) {
				return next(ApiError.BadRequest('Ошибка при валидации'), errors.array());
			};

			const { email, password } = req.body;

			const userData = await userServices.registration(email, password);

			res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true })

			return res.json(userData);
		} catch (error) {
			next(error)
		}
	}
	async login(req, res, next) {
		try {
			const { email, password } = req.body;

			const userData = await userServices.login(email, password);

			res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true })

			return res.json(userData);
		} catch (error) {
			next(error)
		}
	}
	async logout(req, res, next) {
		try {
			const { refreshCookie } = req.cookies;

			const token = await userServices.logout(refreshCookie);
			res.clearCookie('refreshToken')

			return res.json(token);
		} catch (error) {
			next(error)
		}
	}
	async activate(req, res, next) {
		try {
			const { activationLink } = req.params.link;
			await userServices.activate(activationLink);

			return res.redirect(process.env.CLIENT_URL)
		} catch (error) {
			next(error)
		}
	}
	async refresh(req, res, next) {
		try {
			const { refreshToken } = req.cookies;

			const userData = await userServices.refresh(refreshToken);
			res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });


			return res.json(userData);
		} catch (error) {
			next(error)
		}
	}
	async getUsers(req, res, next) {
		try {
			res.json(await userServices.getAllUsers())
		} catch (error) {
			next(error)
		}
	}
}

module.exports = new UserController();