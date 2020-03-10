var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as calc from './ACCalculator';
test('Environment', () => {
    let testEnv = new calc.Environment(3000, 5, 0.11);
    expect(testEnv.kWhPrice()).toStrictEqual(0.11);
});
test('Excel', () => __awaiter(this, void 0, void 0, function* () {
    let testExcel = new calc.CoolGreenExcel;
    // expect(testExcel.excel).toStrictEqual(null);
    function callback(data) {
        expect(data).toBe('peanut butter');
    }
    fetchData(callback);
    testExcel.makeWorkbookString();
    done();
    expect(testExcel.excel).toBe("2");
}));
