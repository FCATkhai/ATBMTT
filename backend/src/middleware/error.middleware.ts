import type { Request, Response, NextFunction } from 'express'

// Middleware xử lý lỗi tập trung
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500
    const message = err.message || 'Internal Server Error'

    console.error(`Error: ${message}`)

    res.status(statusCode).json({
        success: false,
        message
    })
}

export { errorHandler }
