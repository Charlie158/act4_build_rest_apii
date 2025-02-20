import express, { Request, Response } from "express";
import { UnitUser } from "./user.interface";
import { StatusCodes } from "http-status-codes";
import * as database from "./user.database";

export const userRouter = express.Router();

userRouter.get("/users", async (req: Request, res: Response) => {
    try {
        const allUsers: UnitUser[] = await database.findAll();

        if (allUsers.length === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({ msg: "No users at this time." });
        }

        return res.status(StatusCodes.OK).json({ total_users: allUsers.length, allUsers });
    } catch (error) {
        console.error(error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal server error" });
    }
});

userRouter.get("/user/:id", async (req: Request, res: Response) => {
    try {
        const user: UnitUser | null = await database.findOne(req.params.id);

        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: "User not found!" });
        }

        return res.status(StatusCodes.OK).json({ user });
    } catch (error) {
        console.error(error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal server error" });
    }
});

userRouter.post("/register", async (req: Request, res: Response) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: "Please provide all required parameters." });
        }

        const existingUser = await database.findByEmail(email);

        if (existingUser) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: "This email has already been registered." });
        }

        const newUser = await database.create(req.body);
        return res.status(StatusCodes.CREATED).json(newUser);
    } catch (error) {
        console.error(error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal server error" });
    }
});

userRouter.post("/login", async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: "Please provide all required parameters." });
        }

        const user = await database.findByEmail(email);

        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: "No user exists with the provided email." });
        }

        const isPasswordValid = await database.comparePassword(email, password);

        if (!isPasswordValid) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ error: "Incorrect password!" });
        }

        return res.status(StatusCodes.OK).json({ msg: "Login successful", user });
    } catch (error) {
        console.error(error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal server error" });
    }
});

userRouter.put("/user/:id", async (req: Request, res: Response) => {
    try {
        const { username, email, password } = req.body;
        const user = await database.findOne(req.params.id);

        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: `No user found with ID ${req.params.id}` });
        }

        if (!username || !email || !password) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: "Please provide all required parameters." });
        }

        const updatedUser = await database.update(req.params.id, req.body);
        return res.status(StatusCodes.OK).json({ msg: "User updated successfully", updatedUser });
    } catch (error) {
        console.error(error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal server error" });
    }
});

userRouter.delete("/user/:id", async (req: Request, res: Response) => {
    try {
        const user = await database.findOne(req.params.id);

        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: "User does not exist" });
        }

        await database.remove(req.params.id);
        return res.status(StatusCodes.OK).json({ msg: "User deleted successfully" });
    } catch (error) {
        console.error(error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal server error" });
    }
});