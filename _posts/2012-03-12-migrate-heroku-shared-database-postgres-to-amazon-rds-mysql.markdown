---
title: Migrate Heroku Shared Database (Postgres) to Amazon RDS (MySQL)
layout: post
---

[heroku_status]: https://status.heroku.com/ "Heroku status blog"
[amazon_rds]: http://aws.amazon.com/rds/ "Amazon Relational Database Service"
[heroku_amazon_rds]: http://devcenter.heroku.com/articles/amazon_rds "Heroku Dev Center - Amazon RDS"

Heroku is a Platform as a Service (PaaS) that allows you to deploy an application in seconds. By default, your app will use Heroku's *shared database*, a Postgres database instance. This option is suitable for development but not ideal for production purposes.

A cost-effective alternative is Amazon Relational Database Service (RDS), which offers MySQL instances at competitive rates.

To connect this service to your Heroku application, you need to create a new database instance on Amazon RDS and then enable the service by adding the relevant add-on.

Note that Heroku dynos are Amazon EC2 instances and should be in the same zone as your RDS instance to reduce latency between the app server and the database server.

#### Step 1

Create an RDS database instance using the web-based Amazon RDS console.

#### Step 2

Migrate your data from the Heroku shared database to your new Amazon RDS database instance.

Authorize access to the RDS instance from your workstation by running:

    $ rds-authorize-db-security-group-ingress default --cidr-ip 1.1.1.1/32

Replace `1.1.1.1/32` with your public IP subnet.

Now, you can use `taps` to pull data from your Heroku database to your RDS database:

    $ heroku db:pull mysql://user:pass@rdshostname.amazonaws.com/databasename

#### Step 3

Authorize your Heroku app to access the RDS database:

    $ rds-authorize-db-security-group-ingress --db-security-group-name default \
        --ec2-security-group-name default \
        --ec2-security-group-owner-id 098166147350 \
        --aws-credential-file ../credential-file-path.template

#### Step 4

Add the Amazon RDS Heroku add-on:

    $ heroku addons:add amazon_rds url=mysql2://user:pass@rdshostname.amazonaws.com/databasename

That's it.

#### Notes

If you encounter a `Taps Load Error: no such file to load -- taps/operation` error during "Step 2", you might need to install `taps` on your system by running:

    $ gem install taps

Then retry the operation.

Also, remember to update your app's `Gemfile` configuration to load the `mysql2` gem instead of `pg` by changing:

    gem 'pg'

to

    gem 'mysql2'

Resources:

* [Amazon RDS][amazon_rds]
* [Heroku Dev Center - Amazon RDS][heroku_amazon_rds]
