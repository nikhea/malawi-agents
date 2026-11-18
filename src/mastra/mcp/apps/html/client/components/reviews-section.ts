/**
 * Review section rendered on a product page: summary, write/edit form, and the
 * current customer's review actions.
 */
export const reviewsSectionScript = String.raw`
    function renderReviewForm(draft, productId) {
      const review = draft.review || {};
      const rating = Math.max(1, Math.min(5, Number(draft.rating || review.rating || 5)));
      const options = [5, 4, 3, 2, 1].map(function (value) {
        return '<option value="' + value + '"' + (value === rating ? ' selected' : '') + '>' +
          esc(stars(value)) + '</option>';
      }).join("");
      return '<form class="review-form" data-review-form>' +
        '<h3>' + (draft.mode === "edit" ? "Edit your review" : "Write a review") + '</h3>' +
        '<label>Rating<select name="rating">' + options + '</select></label>' +
        '<label>Title<input name="title" type="text" maxlength="120" value="' + esc(review.title || "") + '" /></label>' +
        '<label>Review<textarea name="body" rows="4">' + esc(review.body || "") + '</textarea></label>' +
        '<div class="row end">' +
          '<button type="button" class="link" data-action="cancel-review">Cancel</button>' +
          '<button type="button" class="small" data-action="submit-review">' +
            (draft.mode === "edit" ? "Save changes" : "Post review") +
          '</button>' +
        '</div>' +
      '</form>';
    }

    function renderReviews(detail) {
      const product = detail.product || {};
      const productId = product.id || "";
      const summary = detail.reviews;
      const viewer = detail.viewer;
      const reviews = summary && Array.isArray(summary.reviews) ? summary.reviews : [];
      const signedIn = !!(viewer && viewer.id);
      const ownReview = signedIn
        ? reviews.filter(function (review) { return review.user_id === viewer.id; })[0]
        : null;
      const draft = reviewDraft && reviewDraft.productId === productId ? reviewDraft : null;
      const count = summary ? Number(summary.count || reviews.length) : 0;
      const average = summary ? Number(summary.average || 0) : 0;

      const summaryLine = summary
        ? '<div class="row"><span class="stars">' + stars(average) + '</span>' +
          '<span class="muted small">' + esc(average.toFixed(1)) + ' · ' + count +
          ' review' + (count === 1 ? "" : "s") + '</span></div>'
        : '<p class="muted small">Reviews are not loaded for this product.</p>';

      const head = '<div class="reviews-head"><div><h2>Reviews</h2>' + summaryLine + '</div>' +
        '<div class="row">' +
          (summary && signedIn && !ownReview && !draft
            ? '<button class="small" data-action="write-review" data-product="' + esc(productId) + '">Write a review</button>'
            : '') +
          (!summary
            ? '<button class="link" data-action="refresh-reviews" data-product="' + esc(productId) + '">Load reviews</button>'
            : '') +
        '</div></div>';

      const list = reviews.map(function (review) {
        const mine = signedIn && review.user_id === viewer.id;
        const confirming = pendingReviewDelete === review.id;
        return '<article class="review">' +
          '<div class="row between"><strong>' + esc(review.title || "Review") + '</strong>' +
            '<span class="stars">' + stars(review.rating) + '</span></div>' +
          '<p class="muted small">' + esc(review.author || "Customer") + ' · ' +
            esc(shortDate(review.created_at)) +
            (mine ? ' · <span class="pill">Your review</span>' : '') + '</p>' +
          '<p>' + esc(review.body || "") + '</p>' +
          (mine
            ? '<div class="row end">' +
                (confirming
                  ? '<span class="muted small">Delete this review?</span>' +
                    '<button class="link danger" data-action="delete-review" data-review="' + esc(review.id) + '">Confirm delete</button>' +
                    '<button class="link" data-action="keep-review">Keep</button>'
                  : '<button class="link" data-action="edit-review" data-review="' + esc(review.id) + '">Edit</button>' +
                    '<button class="link danger" data-action="delete-review" data-review="' + esc(review.id) + '">Delete</button>') +
              '</div>'
            : '') +
        '</article>';
      }).join("");

      return '<section class="panel reviews" id="reviews">' +
        head +
        (draft ? renderReviewForm(draft, productId) : "") +
        (list || (summary ? '<p class="muted">No written reviews yet.</p>' : "")) +
      '</section>';
    }
`;
