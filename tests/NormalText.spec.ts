import { bootstrap } from "aurelia-bootstrapper";
import { EventAggregator } from "aurelia-event-aggregator";
import { I18N, TCustomAttribute } from "aurelia-i18n";
import { StageComponent, ComponentTester } from "aurelia-testing";
import { NormalTextCustomElement } from "../src/NormalText/NormalText";
import { Aurelia, PLATFORM } from "aurelia-framework";

describe("NormalText test specs", () => {

    describe("View-model specs", () => {
        let target: NormalTextCustomElement, i18n: I18N, element: Element, ea: EventAggregator, locale: string, spy: jasmine.Spy;

        beforeEach(() => {
            ea = new EventAggregator();
            element = document.createElement("div");
            i18n = new I18N();
            spy = spyOn(i18n, "setLocale").and.callFake((data) => { locale = data; });
        });

        afterEach(() => {
            if (target && target["localeChangeSubscription"]) {
                target["localeChangeSubscription"].unsubscribe();
                target["localeChangeSubscription"] = undefined;
            }
        });

        it("Can be instantiated", () => {
            target = new NormalTextCustomElement(i18n, element, ea);
            expect(target).toBeDefined();
        });
    });

    describe("View specs", () => {

        let component: ComponentTester<any>;
        beforeEach(() => {
            component = StageComponent
                .withResources("NormalText/NormalText");

            component.bootstrap((aurelia: Aurelia) => aurelia.use
                .standardConfiguration()
                // .developmentLogging()
                .plugin(PLATFORM.moduleName("aurelia-i18n"), (instance) => {
                    const aliases = ["t"];
                    TCustomAttribute.configureAliases(aliases);

                    return instance.setup({
                        attributes: aliases,
                        // debug: true,
                        debug: false,
                        fallbackLng: "en",
                        lng: "en",
                        // appendNamespaceToCIMode: true,
                        // initImmediate: false,
                        resources: {
                            en: {
                                translation: {
                                    test: "English test"
                                }
                            }
                        }
                    });
                }));
        });
        afterEach(() => {
            component.dispose();
        });

        it("Should render a dynamic text", (done) => {

            component
                .inView("<normal-text value.bind='boundValue'></normal-text>")
                .boundTo({ boundValue: "Hello Normal Text" })
                .create(bootstrap)
                .then(() => {
                    const spanElement = document.querySelector('normal-text>span');
                    expect(!!spanElement).toBeTruthy();
                    expect(spanElement.textContent.trim()).toBe('Hello Normal Text');
                })
                .catch(e => { console.log(e.toString()) })
                .finally(() => {
                    // component.dispose();
                    done();
                });
        });

        it("Should render the provided static text without i18nKey", (done) => {

            component
                .inView("<normal-text value='Hello Static Text'></normal-text>")
                .create(bootstrap)
                .then(() => {
                    const spanElement = document.querySelector('normal-text>span');
                    expect(!!spanElement).toBeTruthy();
                    expect(spanElement.textContent.trim()).toBe('Hello Static Text');
                })
                .catch(e => { console.log(e.toString()) })
                .finally(() => {
                    // component.dispose();
                    done();
                });
        });

        it("Should render the translated text with a i18nKey", (done) => {
            component
                .inView("<normal-text id='i18n1' value='Ignored Text' i18n-key='test'></normal-text>")
                .create(bootstrap)
                .then(() => {
                    const spanElement = document.querySelector('normal-text#i18n1>span');

                    expect(!!spanElement).toBeTruthy();
                    expect(spanElement.textContent.trim()).toBe('English test');
                })
                .catch(e => { console.log(e.toString()) })
                .finally(() => {
                    // component.dispose();
                    done();
                });
        });
    });
});