import { NgModule } from '@angular/core';
import Interceptors from './interceptors';

import {
  {% for endpoint in endpoints -%}
  {{ ucFirst(endpoint) }}Service,
  {% endfor %}
} from './services';

@NgModule({
  declarations: [],
  imports: [],
  exports: [],
  providers: [
    Interceptors,
    {% for endpoint in endpoints -%}
    {{ ucFirst(endpoint) }}Service,
    {% endfor %}
  ]
})
// @ts-ignore
export class ApiModule { }
