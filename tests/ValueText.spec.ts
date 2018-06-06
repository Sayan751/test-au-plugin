import { bootstrap } from "aurelia-bootstrapper";
import { EventAggregator } from "aurelia-event-aggregator";
import { I18N, TCustomAttribute } from "aurelia-i18n";
import { StageComponent } from "aurelia-testing";
import { ValueTextCustomElement } from "../src/ValueText/ValueText";
import { Aurelia, PLATFORM } from "aurelia-framework";

describe("ValueText test specs", () => {

    describe("View-model specs", () => {
        let target: ValueTextCustomElement, i18n: I18N, element: Element, ea: EventAggregator, locale: string, spy: jasmine.Spy;

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
            target = new ValueTextCustomElement(i18n, element, ea);
            expect(target).toBeDefined();
        });
    });

    describe("View specs", () => {

        let component;
        beforeEach(() => {
            component = StageComponent
                .withResources("ValueText/ValueText");

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

        it("Should render the text in a strong element without any additional style", (done) => {
            const randomId = randomIdGenerator();

            component
                .inView(`<value-text id='${randomId}' value='Hello Static Text'></value-text>`)
                .create(bootstrap)
                .then(() => {
                    const strongElement: HTMLElement = document.querySelector(`value-text#${randomId}>strong`);
                    expect(strongElement).toBeDefined();
                    expect(strongElement.style.cssText).toBeFalsy();
                    expect(Array.from(strongElement.classList).filter(item => !item.startsWith("au-")).length).toBe(0);
                })
                .catch(e => { console.log(e.toString()) })
                .finally(() => {
                    component.dispose();
                    done();
                });
        });

        it("Should render a dynamic text", (done) => {

            component
                .inView("<value-text value.bind='boundValue'></value-text>")
                .boundTo({ boundValue: "Hello Value Text" })
                .create(bootstrap)
                .then(() => {
                    const strongElement = document.querySelector('value-text>strong');
                    expect(strongElement.textContent.trim()).toBe('Hello Value Text');
                })
                .catch(e => { console.log(e.toString()) })
                .finally(() => {
                    component.dispose();
                    done();
                });
        });

        it("Should render the provided static text without i18nKey", (done) => {

            component
                .inView("<value-text value='Hello Static Text'></value-text>")
                .create(bootstrap)
                .then(() => {
                    const strongElement = document.querySelector('value-text>strong');
                    expect(strongElement.textContent.trim()).toBe('Hello Static Text');
                })
                .catch(e => { console.log(e.toString()) })
                .finally(() => {
                    component.dispose();
                    done();
                });
        });

        it("Should render the translated text with a i18nKey", (done) => {
            component
                .inView("<value-text id='i18n1' value='Ignored Text' i18n-key='test'></value-text>")
                .create(bootstrap)
                .then(() => {
                    const strongElement = document.querySelector('value-text#i18n1>strong');
                    expect(strongElement.textContent.trim()).toBe('English test');
                })
                .catch(e => { console.log(e.toString()) })
                .finally(() => {
                    component.dispose();
                    done();
                });
        });
    });
});

const possibleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
function randomIdGenerator() {
    return Array.from({ length: getRandomNumber() }, () => possibleChars[getRandomNumber()]).join("");

    function getRandomNumber() {
        return Math.floor(Math.random() * possibleChars.length);
    }
}