scrap:
  rm -i data/raw_data.json || true
  cd scrapping && scrapy crawl languages -o ../data/raw_data.json
  bat data/raw_data.json
