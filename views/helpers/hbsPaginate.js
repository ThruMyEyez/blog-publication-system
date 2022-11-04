'use strict';

//TODO confine the numbers before and after active page number and prevent that we display to many page numbers

const createPagination = (pagination, options) => {
  if (!pagination) return '';

  const { page, limit: _limit, totalRows } = pagination;

  //* set limit amount of Rows per page
  const limit = _limit ? _limit : 15;

  //* Pagination innerText of control elements default logic
  const lastText = options.hash.lastText
    ? options.hash.lastText
    : '<i class="fa-solid fa-chevrons-right"></i>';

  const firstText = options.hash.firstText
    ? options.hash.firstText
    : '<i class="fa-solid fa-chevrons-left"></i>';

  const prevText = options.hash.prevText
    ? options.hash.prevText
    : '<i class="fa fa-chevron-left"></i>';

  const nextText = options.hash.nextText
    ? options.hash.nextText
    : '<i class="fa fa-chevron-right"></i>';

  //* class variable for pagination '<ul>' container styling
  const ulElementClass = options.hash.ulElementClass
    ? options.hash.ulElementClass
    : 'pagination pagination-sm';

  //* class variable for list elements "<li>" styling
  const liElementClass = options.hash.liElementClass
    ? options.hash.liElementClass
    : 'list-group-item';

  //* rest of the Options
  const {
    liDisabledElementClass,
    liActivePageClass,
    liElementPageClass,
    aElementClass,
    aActiveElementClass
  } = options.hash;

  //* class variable for Page Numbers Middle
  console.log('li class:', options.hash.liElementClass);
  console.log('li class:', liElementClass);

  //get max amount of pages
  const pageCount = Math.ceil(totalRows / _limit);
  //*query params
  console.log(pagination.queryParams);

  //Initialize HTML render string
  let template = `<ul class="${ulElementClass}">`;
  let num;
  //* *** FirstPage & Previous Button ***
  if (page === 1) {
    //* Render disabled FirstPage button
    num = 1;
    template = `${template}<li class="${liDisabledElementClass} disabled"><a class="${aElementClass}" href="?page=${num}">${firstText}</a></li>`;
    template = `${template}<li class="${liDisabledElementClass} disabled"><a class="${aElementClass}" href="?page=${num}">${prevText}</a></li>`;
  } else {
    //* Enabled button state
    num = page - 1;
    template = `${template}<li class="${liElementClass}"><a class="${aElementClass}" href="?page=1">${firstText}</a></li>`;
    template = `${template}<li class="${liElementClass}"><a class="${aElementClass}" href="?page=${num}">${prevText}</a></li>`;
  }
  console.log(pagination);

  //* *** Page Numbers ***
  let leftCount = Math.ceil(limit / 2) - 1;
  const rightCount = limit - leftCount - 1;

  //* stop counter & set it to last page if active page is last page
  leftCount =
    page + rightCount > pageCount ? limit - (pageCount - page) - 1 : leftCount;
  //* count to left from active page
  leftCount = page - leftCount < 1 ? page - 1 : leftCount;

  let i = 0;
  let start = page - leftCount;
  while (i < pageCount && i < limit) {
    num = start;
    template = //* Set current page number li element active
      start === page
        ? `${template}<li class="active ${liActivePageClass}"><a class="${aActiveElementClass}" href="?page=${num}">${num}</a></li>`
        : `${template}<li class="${liElementPageClass}"><a class="${aElementClass}" href="?page=${num}">${num}</a></li>`;
    start++;
    i++;
  }

  //* *** Last & Next Buton ***
  if (page === pageCount) {
    //* Disabled button state
    num = pageCount;
    template = `${template}<li class="${liDisabledElementClass} disabled"><a class="${aElementClass}" href="?page=${num}">${nextText}</a></li>`;
    template = `${template}<li class="${liDisabledElementClass} disabled"><a class="${aElementClass}" href="?page=${num}">${lastText}</a></li>`;
  } else {
    //* Enabled button state
    num = page + 1;
    template = `${template}<li class="${liElementClass}"><a class="${aElementClass}" href="?page=${num}">${nextText}</a></li>`;
    template = `${template}<li class="${liElementClass}"><a class="${aElementClass}" href="?page=${pageCount}">${lastText}</a></li>`;
  }
  return `${template}</ul>`;
};

module.exports = createPagination;
