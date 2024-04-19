const UserModel = require('../models/user-model')
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const mailService = require('../services/mail-service');
const tokenService = require('../services/token-service');
const UserDto = require('../dtos/user-dto');
const ApiError = require('../exceptions/api-error');
const userModel = require('../models/user-model');

class UserService {
	async registration(email, password) {
		const candidate = await UserModel.findOne({ email });
		if (candidate) {
			throw ApiError.BadRequest(`Пользователь с таким адресом ${email} уже существуют`)
		}
		const hashPassword = await bcrypt.hash(password, 3);
		const activationLink = uuid.v4();

		const user = await UserModel.create({ email, password: hashPassword, activate: activationLink });
		// await mailService.sendActivationMail(email, `${process.env.API_HOST}/api/activate/${activationLink}`);

		const userDto = new UserDto(user);
		const { accessToken, refreshToken } = tokenService.generateTokens({ ...userDto });
		await tokenService.saveToken(userDto.id, refreshToken);

		return { accessToken, refreshToken, user: userDto }
	}

	async login(email, password) {
		const user = await UserModel.findOne({ email });

		if (!user) {
			throw ApiError.BadRequest('Пользователя с таким email не существует');
		}

		const isPassEquals = await bcrypt.compare(password, user.password);

		if (!isPassEquals) {
			throw ApiError.BadRequest('Пароль не верный');
		}

		const userDto = new UserDto(user);

		const { accessToken, refreshToken } = tokenService.generateTokens({ ...userDto });
		await tokenService.saveToken(userDto.id, refreshToken);

		return { accessToken, refreshToken, user: userDto }
	}

	async logout(refreshToken) {
		return await tokenService.removeToken(refreshToken);
	}

	async refresh(refreshCookie) {
		if (!refreshCookie) {
			throw ApiError.UnauthorizedError();
		}

		const userData = tokenService.validateRefreshToken(refreshCookie);
		const tokenFromDB = tokenService.findToken(refreshCookie);

		if (!userData || !tokenFromDB) {
			throw ApiError.UnauthorizedError();
		}

		const user = await UserModel.findById(userData.id);
		const userDto = new UserDto(user);

		const { accessToken, refreshToken } = tokenService.generateTokens({ ...userDto });
		await tokenService.saveToken(userDto.id, refreshToken);

		return { accessToken, refreshToken, user: userDto }
	}

	async activate(activationLink) {
		const user = await UserModel.findOne({ activationLink });

		if (!user) {
			throw ApiError.BadRequest('Пользователь не существует');
		}

		user.isActivated = true;

		await user.save();
	}

	async getAllUsers() {
		const users = UserModel.find();
		return users;
	}
}

module.exports = new UserService();