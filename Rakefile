SITE = 'www.focustheweb.com'

desc "Ping search engines about a change in sitemap"
task :ping => :deploy do
  [ "http://www.google.com/webmasters/sitemaps/ping?sitemap=",
    "http://www.bing.com/webmaster/ping.aspx?siteMap=" ].each do |url|
    puts `curl #{url}http://#{SITE}/sitemap.xml`
    end
end

desc "Deploy to S3"
task :deploy do
  sh "jekyll"
  # TODO: use --reduced-redundancy
  sh "s3cmd sync --acl-public --delete-removed _site/ s3://#{SITE}"
end

task :default => :ping