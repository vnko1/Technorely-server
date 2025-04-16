import { Test, TestingModule } from "@nestjs/testing";
import { BaseController } from "./base.controller";
import { BaseService } from "../service";

describe("BaseController", () => {
  let baseController: BaseController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [BaseController],
      providers: [BaseService],
    }).compile();

    baseController = app.get<BaseController>(BaseController);
  });

  describe("root", () => {
    it('should return "Hello World!"', () => {
      expect(baseController.getHello()).toBe("Hello World!");
    });
  });
});
