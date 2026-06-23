import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
	// Not fatal: allow local filesystem fallback when Cloudinary is not configured.
	// This keeps the server usable in environments without Cloudinary credentials.
	// A runtime warning helps during development.
	// eslint-disable-next-line no-console
	console.warn("Cloudinary not fully configured. Falling back to local uploads.");
} else {
	cloudinary.config({
		cloud_name: CLOUDINARY_CLOUD_NAME,
		api_key: CLOUDINARY_API_KEY,
		api_secret: CLOUDINARY_API_SECRET,
	});
}

export default cloudinary;
