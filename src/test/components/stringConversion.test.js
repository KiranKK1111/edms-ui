import { getCustomLabels, getObjFromSubscription } from "../../components/stringConversion";

describe('', () => {

    it("wrapper", () => {
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

    it("wrapper", () => {
        const item = 'clarity id';
        const expectedLabel = 'Clarity ID';
        const response = getCustomLabels(item);
        expect(response).toBe(expectedLabel);
    });
})

