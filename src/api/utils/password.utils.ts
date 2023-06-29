import bcrypt from "bcrypt";

export const createHash = async function (password: string) {
  const saltRounds = 10;
  const salt = await bcrypt.genSalt(saltRounds);
  return await bcrypt.hash(password, salt);
};

export const validatePassword = async function (password: string, hash: string) {
  return await bcrypt.compare(password, hash);
};