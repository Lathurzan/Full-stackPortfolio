export const adminOnly = (
  req: import("express").Request,
  res: import("express").Response,
  next: import("express").NextFunction
) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access only",
    });
  }

  next();
};
