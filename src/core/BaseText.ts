import { bindable } from "aurelia-framework";
import { BaseI18N } from "aurelia-i18n";

export class BaseText extends BaseI18N {
    @bindable public value: string;
    @bindable public i18nKey: string;
}