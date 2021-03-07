import { RouterConfiguration } from '../index.js';
import { RoutingInstruction } from './routing-instruction.js';

export class InstructionParser {
  // public static separators = RouterConfiguration.options.separators;

  // public static parse(instructions: string, grouped: boolean, topScope: boolean, superfluousScope: boolean): { instructions: RoutingInstruction[]; remaining: string } {
  //   const seps = RouterConfiguration.options.separators;
  //   if (!instructions) {
  //     return { instructions: [], remaining: '' };
  //   }
  //   if (instructions.startsWith(seps.sibling) && !InstructionParser.isAdd(instructions)) {
  //     throw new Error(`Instruction parser error: Unnecessary siblings separator ${seps.sibling} in beginning of instruction part "${instructions}".`);
  //   }
  //   // if (instructions.startsWith(seps.groupStart)) {
  //   //   instructions = `${seps.scope}${instructions}`;
  //   // }
  //   const routingInstructions: RoutingInstruction[] = [];
  //   let firstSibling = true;
  //   let guard = 1000;
  //   while (instructions.length && guard) {
  //     guard--;
  //     if (instructions.startsWith(seps.scope)) {
  //       topScope = false;
  //       // if (instructions.startsWith(seps.scope) || instructions.startsWith(seps.groupStart)) {
  //       // if (instructions.startsWith(seps.scope)) {
  //       instructions = instructions.slice(seps.scope.length);
  //       // }
  //       const groupStart = instructions.startsWith(seps.groupStart);
  //       if (groupStart) {
  //         instructions = instructions.slice(seps.groupStart.length);
  //       }
  //       const { instructions: found, remaining } = InstructionParser.parse(instructions, groupStart, false, superfluousScope);
  //       // if (groupStart && found.length < 2 && (!found[0]?.hasNextScopeInstructions ?? false)) {
  //       if (groupStart && found.length < 2 && remaining === '' && firstSibling) {
  //         throw new Error(`Instruction parser error: Unnecessary scopes ${seps.groupStart}${seps.groupEnd} in instruction part "(${instructions}" is not allowed.`);
  //       }
  //       if (routingInstructions.length) {
  //         routingInstructions[routingInstructions.length - 1].nextScopeInstructions = found;
  //       } else {
  //         routingInstructions.push(...found);
  //       }
  //       instructions = remaining;
  //     } else if (instructions.startsWith(seps.groupStart)) {
  //       instructions = instructions.slice(seps.groupStart.length);
  //       const { instructions: found, remaining } = InstructionParser.parse(instructions, true, topScope, superfluousScope);
  //       if (firstSibling && remaining === '') {
  //         throw new Error(`Instruction parser error: Unnecessary scopes ${seps.groupStart}${seps.groupEnd} in instruction part "(${instructions}" is not allowed.`);
  //       }
  //       if (remaining.startsWith(seps.scope)) {
  //         throw new Error(`Instruction parser error: Children below scope ${seps.groupStart}${seps.groupEnd} in instruction part "(${instructions}" is not allowed.`);
  //       }
  //       routingInstructions.push(...found);
  //       instructions = remaining;
  //     } else if (instructions.startsWith(seps.groupEnd)) {
  //       if (grouped) {
  //         instructions = instructions.slice(seps.groupEnd.length);
  //       }
  //       return { instructions: routingInstructions, remaining: instructions };

  //     } else if (instructions.startsWith(seps.sibling) && !InstructionParser.isAdd(instructions)) {
  //       firstSibling = false;
  //       if (!grouped) {
  //         return { instructions: routingInstructions, remaining: instructions };
  //       }
  //       instructions = instructions.slice(seps.sibling.length);

  //     } else {
  //       let routingInstruction: RoutingInstruction;
  //       let remaining: string;
  //       ({ instruction: routingInstruction, remaining, superfluousScope } = InstructionParser.parseOne(instructions, superfluousScope));
  //       routingInstructions.push(routingInstruction);
  //       instructions = remaining;
  //     }
  //   }

  //   return { instructions: routingInstructions, remaining: instructions };
  // }

  public static parse(instructions: string, grouped: boolean, topScope: boolean, superfluousScope: boolean): { instructions: RoutingInstruction[]; remaining: string } {
    const seps = RouterConfiguration.options.separators;
    if (!instructions) {
      return { instructions: [], remaining: '' };
    }
    if (instructions.startsWith(seps.sibling) && !InstructionParser.isAdd(instructions)) {
      throw new Error(`Instruction parser error: Unnecessary siblings separator ${seps.sibling} in beginning of instruction part "${instructions}".`);
    }
    const routingInstructions: RoutingInstruction[] = [];
    let guard = 1000;
    while (instructions.length && guard) {
      guard--;
      if (instructions.startsWith(seps.scope)) {
        if (routingInstructions.length === 0) {
          throw new Error(`Instruction parser error: Children without parent in instruction part "(${instructions}" is not allowed.`);
        }
        topScope = false;
        instructions = instructions.slice(seps.scope.length);
        const groupStart = instructions.startsWith(seps.groupStart);
        if (groupStart) {
          instructions = instructions.slice(seps.groupStart.length);
          grouped = true;
        }
        const { instructions: found, remaining } = InstructionParser.parse(instructions, groupStart, false, superfluousScope);
          routingInstructions[routingInstructions.length - 1].nextScopeInstructions = found;
        instructions = remaining;
      } else if (instructions.startsWith(seps.groupStart)) {
        instructions = instructions.slice(seps.groupStart.length);
        const { instructions: found, remaining } = InstructionParser.parse(instructions, true, topScope, superfluousScope);
        routingInstructions.push(...found);
        instructions = remaining;
      } else if (instructions.startsWith(seps.groupEnd)) {
        if (grouped) {
          instructions = instructions.slice(seps.groupEnd.length);
        }
        let i = 0;
        const ii = instructions.length;
        for (; i < ii; i++) {
          if (instructions.slice(i, i + seps.sibling.length) === seps.sibling) {
            return { instructions: routingInstructions, remaining: instructions };
          }
          if (instructions.slice(i, i + seps.groupEnd.length) !== seps.groupEnd) {
            if (routingInstructions.length > 1) {
              throw new Error(`Instruction parser error: Children below scope ${seps.groupStart}${seps.groupEnd} in instruction part "(${instructions}" is not allowed.`);
            } else {
              instructions = instructions.slice(i);
              break;
            }
          }
        }
        if (i >= ii) {
          return { instructions: routingInstructions, remaining: instructions };
        }
      } else if (instructions.startsWith(seps.sibling) && !InstructionParser.isAdd(instructions)) {
        if (!grouped) {
          return { instructions: routingInstructions, remaining: instructions };
        }
        instructions = instructions.slice(seps.sibling.length);

      } else {
        let routingInstruction: RoutingInstruction;
        let remaining: string;
        ({ instruction: routingInstruction, remaining, superfluousScope } = InstructionParser.parseOne(instructions, superfluousScope));
        routingInstructions.push(routingInstruction);
        instructions = remaining;
      }
    }

    return { instructions: routingInstructions, remaining: instructions };
  }

  private static isAdd(instruction: string): boolean {
    return (instruction === RouterConfiguration.options.separators.add ||
      instruction.startsWith(`${RouterConfiguration.options.separators.add}${RouterConfiguration.options.separators.viewport}`));
  }

  private static parseOne(instruction: string, superfluousScope: boolean): {
    instruction: RoutingInstruction;
    remaining: string;
    superfluousScope: boolean;
  } {
    const seps = RouterConfiguration.options.separators;
    const tokens = [seps.parameters, seps.viewport, seps.noScope, seps.groupEnd, seps.scope, seps.sibling];
    let component: string | undefined = void 0;
    let parametersString: string | undefined = void 0;
    let viewport: string | undefined = void 0;
    let scope = true;
    let token!: string;
    let pos: number;

    // This allows superfluous scopes (using () where it's not needed)
    // if (instruction.startsWith(seps.groupStart)) {
    //   instruction = instruction.slice(seps.groupStart.length);
    //   superfluousScope = true;
    // }
    // if (instruction.startsWith(seps.groupStart)) {
    //   throw new Error(`Instruction parser error: Unnecessary scopes ${seps.groupStart}${seps.groupEnd} in instruction part "${instruction}" is not allowed.`);
    // }
    const specials = [seps.add, seps.clear];
    for (const special of specials) {
      if (instruction === special) {
        component = instruction;
        instruction = '';
        tokens.shift(); // parameters
        tokens.shift(); // viewport
        token = seps.viewport;
        break;
      }
    }
    if (component === void 0) {
      for (const special of specials) {
        if (instruction.startsWith(`${special}${seps.viewport}`)) {
          component = special;
          instruction = instruction.slice(`${special}${seps.viewport}`.length);
          tokens.shift(); // parameters
          tokens.shift(); // viewport
          token = seps.viewport;
          break;
        }
      }
    }

    if (component === void 0) {
      ({ token, pos } = InstructionParser.findNextToken(instruction, tokens));

      component = pos !== -1 ? instruction.slice(0, pos) : instruction;
      instruction = pos !== -1 ? instruction.slice(pos + token.length) : '';

      tokens.shift(); // parameters
      if (token === seps.parameters) {
        ({ token, pos } = InstructionParser.findNextToken(instruction, [seps.parametersEnd]));
        parametersString = instruction.slice(0, pos);
        instruction = instruction.slice(pos + token.length);

        ({ token } = InstructionParser.findNextToken(instruction, tokens));
        instruction = instruction.slice(token.length);
      }

      tokens.shift(); // viewport
    }
    if (token === seps.viewport) {
      ({ token, pos } = InstructionParser.findNextToken(instruction, tokens));
      viewport = pos !== -1 ? instruction.slice(0, pos) : instruction;
      instruction = pos !== -1 ? instruction.slice(pos + token.length) : '';
    }

    tokens.shift(); // noScope
    if (token === seps.noScope) {
      scope = false;
    }

    // Restore token that belongs to next instruction
    if (token === seps.groupEnd || token === seps.scope || token === seps.sibling) {
      instruction = `${token}${instruction}`;
    }

    // This allows superfluous scopes (using () where it's not needed)
    // if (superfluousScope && instruction.startsWith(seps.groupEnd)) {
    //   instruction = instruction.slice(seps.groupEnd.length);
    //   superfluousScope = false;
    // }
    if ((component ?? '') === '') {
      throw new Error(`Instruction parser error: No component specified in instruction part "${instruction}".`);
    }

    const routingInstruction: RoutingInstruction = RoutingInstruction.create(component, viewport, parametersString, scope) as RoutingInstruction;

    return { instruction: routingInstruction, remaining: instruction, superfluousScope };
  }

  private static findNextToken(instruction: string, tokens: string[]): { token: string; pos: number } {
    const matches: Record<string, number> = {};
    // Tokens can have length > 1
    for (const token of tokens) {
      const tokenPos = instruction.indexOf(token);
      if (tokenPos > -1) {
        matches[token] = instruction.indexOf(token);
      }
    }
    const pos = Math.min(...Object.values(matches));
    for (const token in matches) {
      if (matches[token] === pos) {
        return { token, pos };
      }
    }
    return { token: '', pos: -1 };
  }
}
