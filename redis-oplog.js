import './lib/mongo//mongoCollectionNames';

import { RedisPipe, Events } from './lib/constants';
import { Meteor } from 'meteor/meteor';
import init from './lib/init';
import Config from './lib/config';
import { getRedisListener, getRedisPusher } from './lib/redis/getRedisClient';
import SyntheticMutator from './lib/mongo/SyntheticMutator';
import ObservableCollection from './lib/cache/ObservableCollection';
import Vent from './lib/vent/Vent';



// Make the fiber pool size infinite(ish)!
 //
 // Each fiber created adds an entry to `v8::Isolate::ThreadDataTable`. Unfortunatley, items are
 // never deleted from this table. So if we create and delete a lot of fibers, then we leak memory.
 // Worse yet, the table is represented as a linked list, and v8 performs a linear scan of this
 // linked list every time we switch fibers. We've seen cases where Sandstorm was spending 65% of
 // its CPU time just scanning this list! The v8 people say this is "working as intended".
 //
 // The fibers package has implemented a work-around by maintaining a fiber pool. Fibers are not
 // deleted; they are returned to the pool. Unfortunately the pool has a default size of 120. So
 // if we pass 120 simultaneous fibers, we start leaking and slowing down. It's very easy to hit
 // this number with a few dozen users present.
 //
 // Up until it hits the limit, the fibers module will grow the pool dynamically, starting with an
 // empty pool and adding each new fiber to it. Therefore, if we set the pool size to an impossibly
 // large number, we effectively get a pool size equal to the maximum number of simultaneous fibers
 // seen. This is exactly what we want! Now no fibers are ever deleted, so we never leak. A
 // Sandstorm server that sees a brief surge of traffic may end up holding on to unused RAM
 // long-term, but this is a relatively obscure problem.
 //
 // I initially tried to use the value `Infinity` here, but somehow when this made its way down into
 // the C++ code and was converted to an integer, that integer ended up being zero. So instead we
 // use 1e9 (1 billion), which ought to be enough for anyone.
 //
 // Third-party issues, for reference:
 //
 //    https://bugs.chromium.org/p/v8/issues/detail?id=5338
 //    https://bugs.chromium.org/p/v8/issues/detail?id=3777
 //    https://github.com/laverdet/node-fibers/issues/305
var Fiber = Npm.require('fibers');

 Fiber.poolSize = 1e9;

const RedisOplog = {
    init,
};

// Warnings
Meteor.startup(function() {
    if (Package['insecure']) {
        console.log('RedisOplog does not support the insecure package.');
    }
});

export {
    RedisOplog,
    SyntheticMutator,
    ObservableCollection,
    RedisPipe,
    Config,
    Events,
    Vent,
    getRedisListener,
    getRedisPusher,
};

console.log("\n\n\n\n\n\n\n\nSTART WITH REDIS OPLOG PACKAGE ", Object.keys(RedisOplog), process.env.REDIS_HOST, process.env.REDIS_PASSWORD, process.env.REDIS_OPLOG_DEBUG == "true", process.env.REDIS_OPLOG_DEBUG)
if (Meteor.isProduction) {
    RedisOplog.init({
        debug: process.env.REDIS_OPLOG_DEBUG == "true" ? true : false,
        redis: {
            port: 6379,
            host: process.env.REDIS_HOST,
            password: process.env.REDIS_PASSWORD
        },
        // mutationDefaults: {
        //     optimistic: false,
        //     pushToRedis: true
        // }
    })
} else {
    RedisOplog.init({
        debug: true,
        // mutationDefaults: {
        //     optimistic: false,
        //     pushToRedis: true
        // }
    })
}
