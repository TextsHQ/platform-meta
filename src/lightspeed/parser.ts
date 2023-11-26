import { LightSpeedDataTable, LightSpeedTable, Schemas } from './table'
import { LightSpeedStep } from './steps'
import {
  i64_from_string,
  void_function,
} from './value_parsers'
import { getLogger } from '../logger'

const value_functions: { [key in LightSpeedStep]?: Function } = {
  [LightSpeedStep.UNDEFINED]: void_function,
  [LightSpeedStep.I64_FROM_STRING]: i64_from_string,
}
export default class LightSpeedParser {
  table: LightSpeedDataTable = {}

  store: Map<any, any>

  logger = getLogger('META', 'LightSpeedParser')

  constructor() {
    this.table = {}
    this.store = new Map()
  }

  decode(data: any[]): any {
    const step_type = data[0] as LightSpeedStep
    const step_data = data.slice(1)
    switch (step_type) {
      case LightSpeedStep.BLOCK:
        for (const block_data of step_data) {
          this.decode(block_data)
        }
        break
      case LightSpeedStep.LOAD:
        return this.store.get(step_data[0])
      case LightSpeedStep.STORE:
        // eslint-disable-next-line no-case-declarations
        const value = this.decode(step_data[1])
        this.store.set(step_data[0], value)
        break
      case LightSpeedStep.STORE_ARRAY:
        this.store.set(step_data[0], step_data[1])
        this.decode(step_data.slice(2)[0])
        break
      case LightSpeedStep.CALL_STORED_PROCEDURE:
        this.handleStoredProcedure(step_data)
        break
      case LightSpeedStep.I64_FROM_STRING:
        return this.getValue(data, typeof data)
      case LightSpeedStep.IF:
        // eslint-disable-next-line no-case-declarations
        const statement = step_data[0]
        // eslint-disable-next-line no-case-declarations
        const result = this.decode(statement)
        if (result) {
          this.decode(step_data[1])
          break
        }

        if (step_data.length >= 3 && step_data[2]) {
          this.decode(step_data[2])
        }
        break
      case LightSpeedStep.NOT:
        return this.decode(step_data[0])
      default:
        console.log('skipping:', step_type, step_data)
    }
  }

  handleStoredProcedure(data: any[]) {
    try {
      const procedure = data[0] as string
      const procedure_data = data.slice(1)
      const schema_names: string[] = LightSpeedTable[procedure]
      const result_object: { [key: string]: any } = {}
      for (let i = 0; i < procedure_data.length; i++) {
        if (!schema_names) {
          console.log('could not find procedure by name:', procedure)
          continue
        }
        const prop_name = schema_names[i]
        if (!prop_name) {
          console.log(`could not find property with index ${i} on procedure ${procedure}`)
          continue
        }
        if (prop_name.includes('skipped_')) continue
        const prop_data = procedure_data[i]
        const prop_type = typeof prop_data
        const value = this.getValue(prop_data, prop_type)
        result_object[prop_name] = value
      }
      const procedure_table = this.table[procedure]
      if (procedure_table) {
        this.table[procedure].push(result_object as Schemas)
      } else {
        this.table[procedure] = [result_object as Schemas]
      }
    } catch (e) {
      this.logger.error(e)
    }
  }

  getValue(data: any, value_type: string) {
    let value_step: LightSpeedStep
    let val_func
    switch (value_type) {
      case 'string':
      case 'boolean':
      case 'number':
        return data
      case 'object':
        value_step = data[0] as LightSpeedStep
        switch (value_step) {
          case LightSpeedStep.LOAD:
            return this.decode(data)
          default:
            val_func = value_functions[value_step]
            if (!val_func) {
              // throw ?
            } else {
              return val_func(data.length > 1 ? data[1] : data[0])
            }
        }
        break
      default:
        console.log('invalid value_type:', value_type)
    }
  }
}
