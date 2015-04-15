import { _, /*t,*/ log, lazy_require, config, async } from 'azk';
import { SmartProgressBar } from 'azk/cli/smart_progress_bar';
import { Tracker } from 'azk/utils/tracker';

/* global AgentClient, Configure */
lazy_require(this, {
  AgentClient: ['azk/agent/client', 'Client'],
  Configure: ['azk/agent/configure', 'Configure'],
});

var Helpers = {
  requireAgent(cli) {
    return AgentClient
      .status()
      .then((status) => {
        if (!status.agent && !cli.non_interactive) {
          var question = {
            type    : 'confirm',
            name    : 'start',
            message : 'commands.agent.start_before',
            default : 'Y'
          };

          return cli.prompt(question)
            .then((answers) => {
              var cmd = "azk agent start";
              return answers.start ? cli.execSh(cmd) : false;
            });
        }
      })
      .then(() => {
        return AgentClient.require();
      });
  },

  askPermissionToTrack(cli) {
    return async(this, function* () {

      // generate new user id
      var trackerUserId     = yield Tracker.loadTrackerUserId();
      if (typeof trackerUserId === 'undefined') {
        yield tracker.saveTrackerUserId();
      }

      // check if user already answered
      var trackerPermission = yield Tracker.loadTrackerPermission(); // Boolean

      var should_ask_permission = (typeof trackerPermission === 'undefined');
      if (should_ask_permission) {
        var question = {
          type    : 'confirm',
          name    : 'track_ask',
          message : 'analytics.ask_tracker_message',
          default : 'Y'
        };

        var answers = yield cli.prompt(question);
        var tracker = new Tracker();

        if (answers.track_ask) {
          cli.ok('analytics.ask_tracker_message_optIn');
        } else {
          cli.ok('analytics.ask_tracker_message_optOut', {command: 'azk agent start --tracking'});
        }

        yield tracker.saveTrackerPermission(answers.track_ask.toString());

        return answers.track_ask;
      }

      return trackerPermission;
    });
  },

  configure(cli) {
    cli.ok('configure.loading_checking');
    return (new Configure(cli))
      .run()
      .then((configs) => {
        cli.ok('configure.loaded');
        return configs;
      });
  },

  manifestValidate(cmd, manifest) {
    if (config('flags:show_deprecate')) {
      _.each(manifest.validate(), (error) => {
        cmd[error.level](`manifest.validate.${error.key}`, error);
      });
    }
  },

  vmStartProgress(cmd) {
    return (event) => {
      if (!event) {
        return;
      }

      var context = event.context || "agent";
      var keys    = ["status", context];

      switch (event.type) {
        case "status":
          // running, starting, not_running, already_installed
          switch (event.status) {
            case "not_running":
            case "already_installed":
              cmd.fail([...keys].concat(event.status), event.data);
              break;
            case "error":
              if (event.data instanceof Error) {
                cmd.fail(event.data.toString());
              } else {
                cmd.fail([...keys].concat(event.status), event);
              }
              break;
            default:
              if (event.keys) {
                cmd[event.status || "ok"](event.keys, event.data);
              } else {
                cmd.ok([...keys].concat(event.status), event.data);
              }
          }
          break;
        case "try_connect":
          var tKey = [...keys].concat("progress");
          log.info_t(tKey, event);
          cmd.ok(tKey, event);
          break;
        case "ssh":
          if (context === "stderr") {
            break;
          } else {
            log.debug(event);
          }
          break;
        default:
          log.debug(event);
      }
    };
  },

  newPullProgress(cmd) {
    return (msg) => {
      if (msg.type !== "pull_msg") {
        return msg;
      }

      // pull end
      if (msg.end) {
        cmd.ok('commands.helpers.pull.pull_ended', msg);
        return false;
      }

      // manual message, not parsed
      if (msg.traslation) {
        cmd.ok(msg.traslation, msg.data);
        return false;
      }

      if (!_.isNumber(this.non_existent_locally_ids_count)) {
        this.non_existent_locally_ids_count = msg.registry_result.non_existent_locally_ids_count;
      }

      // parse messages by type
      var status = msg.statusParsed;
      switch (status.type) {
        case 'download_complete':
          this.smartProgressBar && this.smartProgressBar.receiveMessage(msg, status.type);
          break;

        case 'download':
          if (_.isUndefined(this.bar)) {
            // show message: ⇲ pulling 5/14 layers.
            cmd.ok('commands.helpers.pull.pull_start', {
              left_to_download_count : msg.registry_result.non_existent_locally_ids_count,
              total_registry_layers  : msg.registry_result.registry_layers_ids_count,
            });

            // create a new progress-bar
            this.bar = cmd.createProgressBar('     [:bar] :percent :layers_left/:layers_total ', {
              complete: '=',
              incomplete: ' ',
              width: 50,
              total: 50
            });

            // control progress-bar with SmartProgressBar
            this.smartProgressBar = new SmartProgressBar(
              50,
              this.non_existent_locally_ids_count,
              this.bar);
          }
          this.smartProgressBar.receiveMessage(msg, status.type);
          break;

        case 'pulling_another':
          cmd.ok('commands.helpers.pull.already_being', msg);
          break;
      }
      return false;
    };
  },

  escapeCapture(callback) {
    // Escape sequence
    var escapeBuffer = false;
    var escape = false;

    return (event) => {
      if (event.type == "stdin_pipe") {
        var stdin  = event.data[0].stdin;
        var stream = event.data[0].stream;
        var container = event.id;
        var stopped = false;

        stdin.on('data', function (key) {
          if (stopped) {
            return false;
          }

          var ch = key.toString(stdin.encoding || 'utf-8');

          if (escapeBuffer && ch === '~') {
            escapeBuffer = false;
            escape = true;
          } else if (ch === '\r') {
            escapeBuffer = true;
            stream.write(key);
          } else {
            if (escape) {
              stopped = callback(ch, container);
              escape = false;
            } else {
              stream.write(key);
            }
            escapeBuffer = false;
          }
        });
      }
      return true;
    };
  }
};

export { Helpers };
