import * as calc from './ACCalculator'

test('Environment', ()=> {
    let testEnv = new calc.Environment(3000, 5,0.11);
    expect(testEnv.kWhPrice()).toStrictEqual(0.11);
});

test('Excel', async () => {
    let testExcel = new calc.CoolGreenExcel;
    // expect(testExcel.excel).toStrictEqual(null);
    function callback(data) {
        expect(data).toBe('peanut butter');
    }
    fetchData(callback);
    testExcel.makeWorkbookString();
    done();
    expect(testExcel.excel).toBe("2");


});