---
title: Migrate Heroku shared database (Postgres) to Amazon RDS (MySQL)
layout: post
---

[heroku_status]: https://status.heroku.com/ "Heroku status blog"
[amazon_rds]: http://aws.amazon.com/rds/ "Amazon Relational Database Service"
[heroku_amazon_rds]: http://devcenter.heroku.com/articles/amazon_rds "Heroku Dev Center - Amazon RDS"

Heroku is a great PaaS, it let you deploy an app in seconds, almost everything
is automated. By default your app will use Heroku *shared database*, a Postgres
db instance which is a perfect choice for development environments but you just
can't use it in production (just take a look at [Heroku status
blog][heroku_status] to get an idea).

A cheap alternative is Amazon Relational Database Service (RDS). It offers MySQL
instances at competitive prices.

To make this service available to your Heroku application you should create a
new database instance at Amazon RDS and then enable this resource by adding the
relative add-on.

Keep in mind that Heroku dynos are Amazon EC2 instances and should be situated
in US-East zone so making a RDS instance in the same zone leads to an optimal
communication speed between app server and db server.

#### Step 1

Create an RDS database instance, you can do it using web based Amazon RDS
console.

#### Step 2

Migrate your data from Heroku shared database to your new Amazon RDS database
instance.

You’ll need to aythorize access to the RDS instance from your workstation
running:

    $ rds-authorize-db-security-group-ingress default --cidr-ip 1.1.1.1/32

where 1.1.1.1/32 is your public IP subnet.

Now you can use `taps` to pull from your Heroku database to your RDS database:

    $ heroku db:pull mysql://user:pass@rdshostname.amazonaws.com/databasename

#### Step 3

Authorize Heroku app access to RDS database

    $ rds-authorize-db-security-group-ingress --db-security-group-name default \
        --ec2-security-group-name default \
        --ec2-security-group-owner-id 098166147350 \
        --aws-credential-file ../credential-file-path.template

#### Step 4

Add Amazon RDS Heroku add-on

    $ heroku addons:add amazon_rds url=mysql2://user:pass@rdshostname.amazonaws.com/databasename

That's all.

#### Notes

If you get `Taps Load Error: no such file to load -- taps/operation` error at
"Step 2" no worries, just install `taps` on your system by running

    $ gem install taps

and retry.

Remember also to update your app's `Gemfile` configuration to load `mysql2` gem
instead of `pg` changing from

    gem 'pg'

to

    gem 'mysql2'

Resources:

* [Amazon RDS][amazon_rds]
* [Heroku Dev Center - Amazon RDS][heroku_amazon_rds]
