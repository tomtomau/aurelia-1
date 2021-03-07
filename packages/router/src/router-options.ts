/* eslint-disable no-template-curly-in-string */
import { INavigatorOptions } from './navigator.js';
import { NavigationState } from './navigation-coordinator.js';
import { RoutingInstruction } from './instructions/routing-instruction.js';
import { IRoutingHookDefinition } from './routing-hook.js';
import { RouterConfiguration } from './index.js';
import { Navigation } from './navigation.js';

/**
 * How contents are swapped in a viewport when transitioning. Default: `attach-next-detach-current`
 */
export type SwapOrder = 'attach-next-detach-current' | 'attach-detach-simultaneously' | 'detach-current-attach-next' | 'detach-attach-simultaneously';

/**
 * The router's title configuration
 */
export interface IRouterTitle extends Partial<ITitleConfiguration> { }

/**
 * The router's title configuration
 */
export interface ITitleConfiguration {
  /**
   * The full application title. Can use placeholders `${componentTitles}`
   * and `${appTitleSeparator} for joined component titles and a separator
   * between the component titles and the application name.
   * Default: '${componentTitles}\${appTitleSeparator}Aurelia'
   */
  appTitle: string;

  /**
   * The separator between the joined component titles and application name.
   * Default: ' | '
   */
  appTitleSeparator: string;

  /**
   * In what order component titles are joined into `${componentTitles}`.
   * Default: 'top-down'
   */
  componentTitleOrder: 'top-down' | 'bottom-up';

  /**
   * The separator between the component titles. Default: ' > '
   */
  componentTitleSeparator: string;

  /**
   * Whether components' names should be used sa titles for components
   * that doesn't specify a title. Default: true
   */
  useComponentNames: boolean;

  /**
   * Prefixes that are removed from components' names before they are
   * used as titles. Default: 'app-'
   */
  componentPrefix: string | string[];

  /**
   * Function that is called for each component/route title. The
   * returned value is used instead as title. Default: undefined
   */
  transformTitle?: (title: string, instruction: RoutingInstruction, navigation: Navigation) => string;
}

export interface ISeparators extends Partial<Separators> { }

/**
 * The separators used in the direct routing syntax
 */
export class Separators {
  /**
   * The character(s) that denotes the start of viewport name
   */
  public viewport: string = '@'; // ':';

  /**
   * The character(s) that separates siblings
   */
  public sibling: string = '+'; // '/';

  /**
   * The character(s) that denotes the start of a new scope
   */
  public scope: string = '/'; // '+';

  /**
   * The character(s) to indicate the start of a grou
   */
  public groupStart: string = '('; // ''

  /**
   * The character(s) to indicate the end of a group
   */
  public groupEnd: string = ')'; // ''

  /**
   * The character(s) to indicate that the viewport doesn't have
   * a routing scope
   */
  public noScope: string = '!';

  /**
   * The character(s) that denotes the start of component parameters
   */
  public parameters: string = '('; // '='

  /**
   * The character(s) that denotes the end of component parameters
   */
  public parametersEnd: string = ')'; // ''

  /**
   * The character(s) that separates component parameters
   */
  public parameterSeparator: string = ','; // '&'

  /**
   * The character(s) that separates a component parameter's key and value
   */
  public parameterKeySeparator: string = '=';

  /**
   * The character(s) that denotes that the instructions are additive/not
   * full viewport state
   */
  public add: string = '+';

  /**
   * The character(s) that denotes that a viewport or routing scope should
   * be cleared/emptied
   */
  public clear: string = '-';

  /**
   * The character(s) that denotes the start of a component method (not yet
   * implemented)
   */
  public action: string = '.';
}

export interface IRouterOptions extends Omit<Partial<RouterOptions>, 'separators' | 'title'> {
  /**
   * The router's title configuration
   */
  title?: string | IRouterTitle;

  /**
   * The separators used in the direct routing syntax
   */
  separators?: ISeparators;

  /**
   * Global routing hooks that should be added (primarily from start)
   */
  hooks?: IRoutingHookDefinition[];
}

export class RouterOptions implements INavigatorOptions {
  /**
   * The separators used in the direct routing syntax
   */
  public separators: Separators = new Separators();
  // public separators: ISeparators = {
  //   viewport: '@', // ':',
  //   sibling: '+', // '/',
  //   scope: '/', // '+',
  //   groupStart: '(', // ''
  //   groupEnd: ')', // ''
  //   noScope: '!',
  //   parameters: '(', // '='
  //   parametersEnd: ')', // ''
  //   parameterSeparator: ',', // '&'
  //   parameterKeySeparator: '=',
  //   add: '+',
  //   clear: '-',
  //   action: '.',
  // };

  /**
   * Whether the fragment should be used for the url/path
   */
  public useUrlFragmentHash: boolean = true;

  /**
   * Whether the `href` html attribute can be used like the `load` custom attribute
   */
  public useHref: boolean = true;

  /**
   * The amount of navigation history entries that are stateful. Default: 0
   */
  public statefulHistoryLength: number = 0;

  /**
   * Whether direct routing should be used. Default: true
   */
  public useDirectRouting: boolean = true;

  /**
   * Whether configured routes should be used. Default: true
   */
  public useConfiguredRoutes: boolean = true;

  /**
   * Whether a load instruction by default is additive, that is specifying
   * the change of the state of viewports rather than the complete state
   * of viewports. Default: true
   */
  public additiveInstructionDefault: boolean = true;

  /**
   * The router's title configuration
   */
  public title: ITitleConfiguration = {
    // eslint-disable-next-line no-useless-escape
    appTitle: "${componentTitles}\${appTitleSeparator}Aurelia",
    appTitleSeparator: ' | ',
    componentTitleOrder: 'top-down',
    componentTitleSeparator: ' > ',
    useComponentNames: true,
    componentPrefix: 'app-',
  };

  /**
   * The navigation states that are synced meaning that sibling viewports
   * will wait for all other siblings to reach the navigation state before
   * continuing with the next steps in the transition. For example, the
   * `guardedUnload` sync state means that no sibling will continue with
   * the `canLoad` hook before all siblings have completed the `canUnload`
   * hooks. To get v1 routing hook behavior, where all routing hooks are
   * synced,`guardedLoad`, `unload` and `load` should be added to default.
   * Default: `guardedUnload`, `swapped`, `completed`
   */
  public navigationSyncStates: NavigationState[] = ['guardedUnload', 'swapped', 'completed'];

  /**
   * How contents are swapped in a viewport when transitioning. Default: `attach-next-detach-current`
   */
  public swapOrder: SwapOrder = 'attach-next-detach-current';

  /**
   * Apply router options.
   *
   * @param options - The options to apply
   */
  public apply(options: IRouterOptions): void {
    options = options ?? {};
    const titleOptions = {
      ...RouterConfiguration.options.title,
      ...(typeof options.title === 'string' ? { appTitle: options.title } : options.title),
    };
    options.title = titleOptions;

    // RouterConfiguration.options.separators.apply(options.separators);
    const separatorOptions: ISeparators = {
      ...RouterConfiguration.options.separators,
      ...(options as IRouterOptions & { separators: ISeparators }).separators ?? {},
    };
    (options as IRouterOptions & { separators: ISeparators }).separators = separatorOptions;

    if (Array.isArray(options.hooks)) {
      options.hooks.forEach(hook => RouterConfiguration.addHook(hook.hook, hook.options));
      delete options['hooks'];
    }

    Object.assign(this, options);
  }
}
