import { getCustomLabels, getObjFromSubscription } from "../../components/stringConversion";

describe('stringConversion', () => {

    it("should return value from subscription businessRequirements by key", () => {
        const subscription = {
            businessRequirements: [
                {
                    key1: "value1",
                    key2: "value2",
                },
            ],
        };

        const value = "key1";
        const expectedValue = "value1";

        const result = getObjFromSubscription(subscription, value);

        expect(result).toBe(expectedValue);
    });

    it("should return custom label for clarity id", () => {
        const item = 'clarity id';
        const expectedLabel = 'Clarity ID';
        const response = getCustomLabels(item);
        expect(response).toBe(expectedLabel);
    });
})

