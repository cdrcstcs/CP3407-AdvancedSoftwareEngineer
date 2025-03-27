import { Response } from "express";
import { AuthenticatedRequest } from "../interface/Request";
import { FindByIdStrategy } from "../interface/Request";
import { UserRetrievalStrategy } from "../interface/Request";
class StrategyPattern {
    private userRetrievalStrategy: UserRetrievalStrategy;

    constructor(userRetrievalStrategy: UserRetrievalStrategy) {
        this.userRetrievalStrategy = userRetrievalStrategy;
    }

    setUserRetrievalStrategy(userRetrievalStrategy: UserRetrievalStrategy) {
        this.userRetrievalStrategy = userRetrievalStrategy;
    }

    async getCurrentUser(req: AuthenticatedRequest, res: Response) {
        try {
            // Using the selected strategy to retrieve the current user
            const currentUser = await this.userRetrievalStrategy.getCurrentUser(req);

            if (!currentUser) {
                return res.status(404).json({ message: "User not found" });
            }

            res.json(currentUser);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Something went wrong" });
        }
    }
}

// Example Usage
const findByIdStrategy = new FindByIdStrategy();

// Using the FindByIdStrategy to get the current user
export const userController = new StrategyPattern(findByIdStrategy);
